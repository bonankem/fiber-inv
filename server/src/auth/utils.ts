import { randomInt } from "node:crypto";
import type { JWT } from "@fastify/jwt";
import { compareSync, hashSync } from "bcryptjs";
import { generateSecret, generateURI } from "otplib";
import { type AuthResultT, AuthStatus, type AuthSuccessT } from "schema/auth";
import { userFullP } from "schema/people";
import z from "zod";
import { appEnv } from "#/env";
import { MfaMode, type Prisma, prisma } from "#/prisma";
import type { UserSelect } from "#/prisma/generated/models";
import { bad, type Maybe, newUuid } from "#/utils";
import { decrypt, encrypt } from "../utils/encryption";

const isDev = appEnv.NODE_ENV !== "production";

export function badLogin(): never {
  bad("Invalid email or password");
}

export function badToken(): never {
  bad("Invalid or expired token");
}

export const loginUserS = {
  id: true,
  email: true,
  isAdmin: true,
  password: true,
  authenticator: true,
} satisfies UserSelect;

type LoginUserT = Prisma.UserGetPayload<{ select: typeof loginUserS }>;

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
  jwt: JWT,
  userId: string,
  existing?: string,
): Promise<AuthSuccessT> {
  const id = existing || newUuid();
  const ids = { userId, sessionId: id };
  const token = jwt.sign(ids, { expiresIn: "1d" });
  const refresh = jwt.sign(ids, { expiresIn: "7d" });
  const expiry = new Date(Date.now() + 7 * 86400000);
  const hashed = hashSync(refresh);

  const { user } = await prisma.session.upsert({
    where: { id },
    update: { hashed, expiry, userId },
    create: { hashed, expiry, userId, id },
    select: { user: userFullP },
  });

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
  const otpUri = generateURI({ issuer: "ServiceX", label: u.email, secret });
  return { secret, otpUri };
}

export async function authResult(
  jwt: JWT,
  user: LoginUserT,
): Promise<AuthResultT> {
  const S = AuthStatus;
  const M = MfaMode;

  const incomplete = <S extends AuthStatus, T>(status: S, data: T) => {
    const userId = user.id;
    const token = jwt.sign({ userId }, { expiresIn: "1h" });
    return { status, userId, token, ...data };
  };

  const pass = user.password;
  const mode = pass?.mfaMode;

  if (pass?.mustChange) {
    return incomplete(S.NEEDS_CHANGE, {});
  }

  if (mode === M.UNDECIDED || !mode) {
    return incomplete(S.NEEDS_MFA_MODE, {});
  }

  if (mode === M.AUTHENTICATOR) {
    const { secret, installed } = await getAuthenticator(user.id);
    if (installed) return incomplete(S.NEEDS_OTP, { mode });

    const data = await authInstall(user, secret);
    return incomplete(S.NEEDS_INSTALL, data);
  }

  if (mode !== M.NONE) {
    const otp = isDev ? "456789" : randomInt(111111, 999999).toString();
    const hashed = hashSync(otp);
    await prisma.otp.create({
      data: { userId: user.id, mode, hashed },
    });
    return incomplete(S.NEEDS_OTP, { mode });
  }

  return authSuccess(jwt, user.id);
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
