import { httpErrors } from "@fastify/sensible";
import dayjs from "dayjs";
import { type AuthLoginReqT, authLoginReqZ } from "schema/auth";
import type { Maybe } from "schema/utils";
import { authLog } from "#/admin/adm-syslog.api";
import { AuthAction, prisma } from "#/db";
import { bad } from "#/utils/errors";
import {
  type AnyRequest,
  type App,
  postRoute,
  type RequestWith,
} from "#/utils/routing";
import {
  authResult,
  badLogin,
  checkHash,
  getLoginUser,
  type LoginUserT,
} from "./utils";

export const loginApi = postRoute({
  url: "/auth/login",
  schema: authLoginReqZ,
  handler: (req, app) => login(req, app),
});

async function login(req: RequestWith<AuthLoginReqT>, app: App) {
  const { email, password } = req.body;
  const u = await getLoginUser({ email });

  const now = new Date();
  const lockUntil = u?.password?.lockUntil;
  if (lockUntil && lockUntil > now) {
    throw httpErrors.tooManyRequests(
      "Account locked: too many failed login attempts",
    );
  }

  if (!checkHash(password, u?.password?.hashed)) {
    await logPasswordFailed(req, u, now);
    badLogin();
  }

  if (u.expiredAt) {
    bad("Account expired. Contact administrator.");
  }
  return authResult(app, req, u);
}

function checkRestrictions(user: LoginUserT, now: Date) {}

async function logPasswordFailed(
  req: RequestWith<AuthLoginReqT>,
  user: Maybe<LoginUserT>,
  time: Date,
) {
  const email = req.body.email;

  await authLog(AuthAction.PASSWORD_FAILED, req, email);
  if (user) await maybeLockout(user, req, time);
}

async function maybeLockout(user: LoginUserT, req: AnyRequest, time: Date) {
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
  const email = user.email;
  if (attempts.every((a) => a.action === PASSWORD_FAILED)) {
    const lockUntil = dayjs(time).add(sec.lockoutMinutes, "minutes").toDate();
    await prisma.password.update({ where: { userId }, data: { lockUntil } });
    await authLog(AuthAction.LOCKOUT, req, email);
  }
}
