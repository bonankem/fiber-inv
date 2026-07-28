import { httpErrors } from "@fastify/sensible";
import dayjs from "dayjs";
import { type AuthLoginReqT, authLoginReqZ } from "schema/auth";
import { bad, Err } from "schema/errors";
import type { Maybe } from "schema/utils";
import { authLog } from "#/admin/adm-syslog.api";
import { AuthAction, prisma } from "#/db";
import {
  type AnyRequest,
  type App,
  postRoute,
  type RequestWith,
} from "#/utils/routing";
import { authResult, checkHash, getLoginUser, type LoginUserT } from "./utils";

export const loginApi = postRoute({
  url: "/auth/login",
  schema: authLoginReqZ,
  handler: (req, app) => login(req, app),
});

async function login(req: RequestWith<AuthLoginReqT>, app: App) {
  const { email, password } = req.body;
  const u = await getLoginUser({ email });

  const now = new Date();
  if (u?.lockUntil && u.lockUntil > now) {
    throw httpErrors.tooManyRequests(
      "Account locked: too many failed login attempts",
    );
  }

  if (!checkHash(password, u?.password?.hashed)) {
    await logPasswordFailed(req, u, now);
    bad(Err.INVALID_LOGIN);
  }

  if (u.expiredAt) bad(Err.ACCOUNT_EXPIRED);
  return authResult(app, req, u);
}

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
  const { PASSWORD_FAILED, LOGIN_SUCCESS, UNLOCKED_BY_ADMIN } = AuthAction;
  const sec = await prisma.security.findFirst();
  if (!sec) return;

  const max = sec.lockoutAttempts;
  const logs = await prisma.authLog.findMany({
    where: {
      email: user.email,
      action: { in: [PASSWORD_FAILED, LOGIN_SUCCESS, UNLOCKED_BY_ADMIN] },
    },
    take: max,
    select: { action: true },
    orderBy: { time: "desc" },
  });

  if (logs.length >= max && logs.every((a) => a.action === PASSWORD_FAILED)) {
    const lockUntil = dayjs(time).add(sec.lockoutMinutes, "minutes").toDate();
    await prisma.user.update({ where: { id: user.id }, data: { lockUntil } });
    await authLog(AuthAction.LOCKOUT, req, user.email);
  }
}
