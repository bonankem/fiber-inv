import { randomInt } from "node:crypto";
import type { JWT } from "@fastify/jwt";
import { compareSync, hashSync } from "bcryptjs";
import dayjs from "dayjs";
import { generateSecret, generateURI, verifySync } from "otplib";
import {
  type AuthResultT,
  AuthStatus,
  type AuthSuccessT,
  IoEvent,
} from "schema/auth";
import { bad, Err } from "schema/errors";
import { userFullS } from "schema/people";
import type { Maybe } from "schema/utils";
import z from "zod";
import { authLog } from "#/admin/adm-syslog.api";
import { AuthAction, MfaMode, OtpReason, type Prisma, prisma } from "#/db";
import { isDev } from "#/env";
import { sendMail } from "#/mail/send";
import { newUuid } from "#/utils/ids";
import type { AnyRequest, App } from "#/utils/routing";
import { decrypt, encrypt } from "../utils/encryption";
import {
  ADMIN_PASS_LENGTH,
  OTP_EXPIRY_MINUTES,
  PASS_HISTORY,
  USER_PASS_LENGTH,
} from "./config";

type OtpUserT = Pick<LoginUserT, "id" | "email">;

export async function deliverOtp(
  mode: MfaMode,
  user: OtpUserT,
  reason: OtpReason,
) {
  const otp = randomInt(111111, 999999).toString();
  const until = dayjs().add(OTP_EXPIRY_MINUTES, "minutes");

  sendUserOtp(user, mode, otp);
  await prisma.otp.create({
    data: {
      mode,
      reason,
      userId: user.id,
      hashed: hashSync(otp),
      expiresAt: until.toDate(),
    },
  });

  if (isDev) console.log(`${otp} via ${mode}`);
  return otp;
}

export function sendUserOtp(user: OtpUserT, mode: MfaMode, otp: string) {
  if (mode === MfaMode.EMAIL) {
    sendMail({
      to: [user.email],
      subject: "Verify OTP",
      body: [`Your OTP is ${otp}`],
    });
  }
}

export function badOtp(): never {
  bad(Err.INCORRECT_OTP);
}

export async function checkOtp(userId: string, otp: string, mode: MfaMode) {
  if (mode === MfaMode.AUTHENTICATOR) {
    const db = prisma.authenticator;
    const a = await db.findUnique({ where: { userId } });
    if (!a) bad(Err.INCORRECT_OTP);

    const { valid } = verifySync({
      secret: decrypt(a.secret),
      token: otp,
      epochTolerance: 30,
    });
    if (!valid) bad(Err.INCORRECT_OTP);
  } else {
    const since = new Date(Date.now() - OTP_EXPIRY_MINUTES * 60000);
    const otps = await prisma.otp.findMany({
      where: { userId, mode, createdAt: { gte: since } },
    });
    const valid = otps.some((o) => compareSync(otp, o.hashed));
    if (!valid) bad(Err.INCORRECT_OTP);
  }

  await prisma.otp.deleteMany({
    where: { userId, reason: OtpReason.CHANGE_PASSWORD },
  });
}

export const loginUserS = {
  id: true,
  name: true,
  email: true,
  isAdmin: true,
  mfaMode: true,
  mfaVerified: true,
  lockUntil: true,
  password: true,
  expiredAt: true,
  lastActive: true,
  authenticator: true,
} satisfies Prisma.UserSelect;

export type LoginUserT = Prisma.UserGetPayload<{ select: typeof loginUserS }>;

export function getLoginUser(where: Prisma.UserWhereUniqueInput) {
  return prisma.user.findUnique({ where, select: loginUserS });
}

export function checkHash(
  plain: string,
  hashed: Maybe<string>,
): hashed is string {
  return !!hashed && compareSync(plain, hashed);
}

export async function authSuccess(
  app: App,
  req: AnyRequest,
  userId: string,
  existing?: string,
): Promise<AuthSuccessT> {
  const { jwt, ioUser } = app;
  const id = existing || newUuid();
  const ids = { userId, sessionId: id };
  const token = jwt.sign(ids, { expiresIn: "1d" });
  const refresh = jwt.sign(ids, { expiresIn: "7d" });
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  const hashed = hashSync(refresh);
  const now = new Date();

  const user = await prisma.user.update({
    select: userFullS,
    where: { id: userId },
    data: {
      lastActive: now,
      joined: true,
      sessions: {
        upsert: {
          where: { id },
          update: { hashed, expiresAt },
          create: { hashed, expiresAt, id },
        },
        updateMany: {
          where: { userId, id: { not: id } },
          data: { replacedAt: now },
        },
      },
    },
  });
  await authLog(AuthAction.LOGIN_SUCCESS, req, user.email);
  ioUser(userId, IoEvent.NEW_SESSION);

  const status = AuthStatus.SUCCESS;
  return { status, user, token, refresh };
}

async function getAuthenticator(userId: string) {
  const db = prisma.authenticator;
  const a = await db.findUnique({ where: { userId } });
  if (a) {
    const secret = decrypt(a.secret);
    const installed = a.installed;
    return { secret, installed };
  }

  const installed = false;
  const secret = generateSecret();
  const s = encrypt(secret);
  await db.create({ data: { userId, installed, secret: s } });
  return { secret, installed };
}

async function authInstall(u: LoginUserT, secret: string) {
  const otpUri = generateURI({
    issuer: "ServiceX",
    label: u.email,
    secret,
  });
  return { secret, otpUri };
}

export async function authResult(
  app: App,
  req: AnyRequest,
  user: LoginUserT,
  modePicked?: boolean,
): Promise<AuthResultT> {
  const S = AuthStatus;
  const M = MfaMode;

  const incomplete = <S extends AuthStatus, T>(status: S, data: T) => {
    const userId = user.id;
    const token = app.jwt.sign({ userId }, { expiresIn: "1h" });
    return { status, userId, token, ...data };
  };

  const mode = user.mfaMode;

  if (user.password?.mustChange) {
    return incomplete(S.NEEDS_CHANGE, {
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  }

  if (!mode || mode === M.UNDECIDED || (!user.mfaVerified && !modePicked)) {
    // no MFA mode has been verified yet, so pick one
    return incomplete(S.NEEDS_MFA_MODE, {});
  }

  if (mode === M.AUTHENTICATOR) {
    const { secret, installed } = await getAuthenticator(user.id);

    // authenticator is installed, request an OTP
    if (installed) return incomplete(S.NEEDS_OTP, { mode });

    // authenticator is not installed, send the QR code URI
    const data = await authInstall(user, secret);
    return incomplete(S.NEEDS_INSTALL, data);
  }

  if (mode !== M.NONE) {
    await deliverOtp(mode, user, OtpReason.LOGIN);
    return incomplete(S.NEEDS_OTP, { mode });
  }

  // authentication complete
  return authSuccess(app, req, user.id);
}

const tempTokenZ = z.object({ userId: z.string() });

export function verifyTempToken(jwt: JWT, token: string) {
  try {
    return tempTokenZ.parse(jwt.verify(token));
  } catch (e) {
    if (isDev) console.error(e);
    bad(Err.INVALID_TOKEN);
  }
}

const authIdsZ = z.object({
  userId: z.string(),
  sessionId: z.string(),
});

export type AuthIdsT = z.infer<typeof authIdsZ>;

export function tryAuthToken(jwt: JWT, token: Maybe<string>) {
  if (!token) return null;
  try {
    return authIdsZ.parse(jwt.verify(token));
  } catch (e) {
    if (isDev) console.error(e);
    return null;
  }
}

export async function checkNewPassword(newPass: string, user: LoginUserT) {
  const min = user.isAdmin ? ADMIN_PASS_LENGTH : USER_PASS_LENGTH;
  if (newPass.length < min) bad(Err.PASSWORD_TOO_SHORT);

  const older = user.password?.history ?? [];
  const found = older.some((h) => compareSync(newPass, h));
  if (found) bad(Err.CANNOT_REUSE_PASSWORD_HISTORY);

  const hashed = hashSync(newPass);
  const history = [...older, hashed].slice(-PASS_HISTORY);
  return { hashed, history, mustChange: false, lastChange: new Date() };
}

export async function checkPasswordChange(
  oldPass: string,
  newPass: string,
  user: LoginUserT,
) {
  const p = user?.password;
  const match = p && compareSync(oldPass, p.hashed);
  if (!match) bad(Err.OLD_PASSWORD_IS_INCORRECT);
  if (oldPass === newPass) bad(Err.CANNOT_USE_SAME_PASSWORD);
  return checkNewPassword(newPass, user);
}
