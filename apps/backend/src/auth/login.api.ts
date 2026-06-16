import type { JWT } from "@fastify/jwt";
import { httpErrors } from "@fastify/sensible";
import dayjs from "dayjs";
import { type AuthLoginReqT, authLoginReqZ } from "schema/auth";
import { AuthAction, prisma } from "#/db";
import { type Maybe, postRoute } from "#/utils";
import {
  type AuthReq,
  authResult,
  badLogin,
  checkHash,
  getLoginUser,
  type LoginUserT,
} from "./utils";

export default postRoute(
  "/auth/login",
  () => authLoginReqZ,
  (req, app) => login(req, app.jwt),
);

async function login(req: AuthReq<AuthLoginReqT>, jwt: JWT) {
  const { email, password } = req.body;
  const u = await getLoginUser({ email });

  const now = new Date();
  const lock = u?.password?.lockUntil;
  if (lock && lock > now) {
    throw httpErrors.tooManyRequests(
      "Account locked: too many failed login attempts",
    );
  }

  if (!checkHash(password, u?.password?.hashed)) {
    await logPasswordFailed(req, u, now);
    badLogin();
  }

  return authResult(jwt, req, u);
}

async function logPasswordFailed(
  req: AuthReq<AuthLoginReqT>,
  user: Maybe<LoginUserT>,
  time: Date,
) {
  await prisma.authLog.create({
    data: {
      action: AuthAction.PASSWORD_FAILED,
      email: req.body.email,
      time,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });
  if (user) {
    await maybeLockout(user, req, time);
  }
}

async function maybeLockout(user: LoginUserT, req: AuthReq, time: Date) {
  const { PASSWORD_FAILED, LOGIN_SUCCESS } = AuthAction;
  const sec = await prisma.security.findFirst();
  if (!sec) return;

  const attempts = await prisma.authLog.findMany({
    where: {
      email: user.email,
      action: { in: [PASSWORD_FAILED, LOGIN_SUCCESS] },
    },
    take: sec.lockoutAttempts,
    select: { action: true },
    orderBy: { time: "desc" },
  });

  const userId = user.id;
  if (attempts.every((a) => a.action === PASSWORD_FAILED)) {
    const lockUntil = dayjs(time).add(sec.lockoutMinutes, "minutes").toDate();
    await prisma.password.update({ where: { userId }, data: { lockUntil } });
    await prisma.authLog.create({
      data: {
        action: AuthAction.LOCKOUT,
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
  }
}
