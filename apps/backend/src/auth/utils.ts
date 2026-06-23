import { randomInt } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";
import type { JWT } from "@fastify/jwt";
import { httpErrors } from "@fastify/sensible";
import { compare, compareSync, hashSync } from "bcryptjs";
import dayjs from "dayjs";
import { generateSecret, generateURI, verifySync } from "otplib";
import {
  type AuthResultT,
  AuthStatus,
  type AuthSuccessT,
  IoEvent,
} from "schema/auth";
import { userFullP } from "schema/people";
import z from "zod";
import { sendSyslog } from "#/admin/syslog.api";
import { AuthAction, MfaMode, OtpReason, type Prisma, prisma } from "#/db";
import { isDev } from "#/env";
import { sendMail } from "#/mail";
import { type AnyRequest, type App, bad, type Maybe, newUuid } from "#/utils";
import { decrypt, encrypt } from "../utils/encryption";
import {
  ADMIN_PASS_LENGTH,
  OTP_EXPIRY_MINUTES,
  PASS_HISTORY,
  USER_PASS_LENGTH,
} from "./config";

export function badLogin(): never {
  bad("Invalid email or password");
}

export function badToken(): never {
  bad("Invalid or expired token");
}

export function wrongPassword(): never {
  bad("Old password is not correct");
}

export function sessionExpired(): never {
  throw httpErrors.unauthorized("Session expired");
}

export function sessionReplaced(): never {
  throw httpErrors.unauthorized("Session ended due to login on another device");
}

export function randomOtp() {
  return randomInt(111111, 999999).toString();
}

type OtpUserT = Pick<LoginUserT, "id" | "email">;

export async function deliverOtp(
  mode: MfaMode,
  user: OtpUserT,
  reason: OtpReason,
) {
  const { EMAIL } = MfaMode;
  if (mode !== EMAIL) return "";

  const otp = randomOtp();

  sendUserOtp(user, mode, otp);
  const until = dayjs().add(OTP_EXPIRY_MINUTES, "minutes");
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
      lines: [`Your OTP is ${otp}`],
    });
  }
}

export function badOtp(): never {
  bad("Incorrect or expired OTP");
}

export async function checkOtp(userId: string, otp: string, mode: MfaMode) {
  if (mode === MfaMode.AUTHENTICATOR) {
    const db = prisma.authenticator;
    const a = await db.findUnique({ where: { userId } });
    if (!a) badOtp();

    const verified = verifySync({
      secret: decrypt(a.secret),
      token: otp,
      epochTolerance: 30,
    });
    if (!verified.valid) badOtp();
  }

  const since = new Date(Date.now() - OTP_EXPIRY_MINUTES * 60000);
  const otps = await prisma.otp.findMany({
    where: { userId, mode, createdAt: { gte: since } },
  });
  const valid = otps.some((o) => compareSync(otp, o.hashed));
  if (!valid) badOtp();

  await prisma.otp.deleteMany({
    where: { userId, reason: OtpReason.CHANGE_PASSWORD },
  });
}

export type AuthReq<T = unknown> = {
  ip: string;
  body: T;
  headers: IncomingHttpHeaders;
  jwtVerify: AnyRequest["jwtVerify"];
};

export const loginUserS = {
  id: true,
  name: true,
  email: true,
  isAdmin: true,
  password: true,
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
  req: AuthReq,
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

  const { user } = await prisma.session.upsert({
    where: { id },
    update: { hashed, expiresAt, userId },
    create: { hashed, expiresAt, userId, id },
    select: { user: userFullP },
  });

  await prisma.session.updateMany({
    where: { userId, id: { not: id } },
    data: { replacedAt: now },
  });

  await prisma.authLog.create({
    data: {
      action: AuthAction.LOGIN_SUCCESS,
      email: user.email,
      ipAddress: (req.headers["x-real-ip"] as string) || req.ip,
      userAgent: req.headers["user-agent"],
    },
  });
  await sendSyslog(AuthAction.LOGIN_SUCCESS, {
    email: user.email,
    ip: req.ip,
  });

  await prisma.password.update({
    where: { userId },
    data: { lockUntil: null },
  });

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
  req: AuthReq,
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

  const pass = user.password;
  const mode = pass?.mfaMode;

  if (pass?.mustChange) {
    return incomplete(S.NEEDS_CHANGE, {
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  }

  if (!mode || mode === M.UNDECIDED || (!pass.mfaVerified && !modePicked)) {
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
    badToken();
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
  if (newPass.length < min) bad("Password too short");

  const older = user.password?.history ?? [];
  const tests = await Promise.all(older.map((h) => compare(newPass, h)));
  if (tests.some(Boolean)) bad("Cannot use password from recent history");

  const hashed = hashSync(newPass);
  const history = [...older, hashed].slice(-PASS_HISTORY);
  return { hashed, history, mustChange: false, lastChange: new Date() };
}

export async function checkPasswordChange(
  oldPass: string,
  newPass: string,
  user: LoginUserT,
) {
  const pass = user?.password || wrongPassword();
  if (!compareSync(oldPass, pass.hashed)) wrongPassword();
  if (oldPass === newPass) bad("Cannot reuse the same password");
  return checkNewPassword(newPass, user);
}
