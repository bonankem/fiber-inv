import { type AuthChangeReqT, authChangeReqZ } from "schema/auth";
import { sendSyslog } from "#/admin/syslog";
import { AuthAction, prisma } from "#/db";
import { type App, bad, postRoute } from "#/utils";
import {
  type AuthReq,
  authResult,
  badToken,
  checkPasswordChange,
  getLoginUser,
  verifyTempToken,
} from "./utils";

export default postRoute(
  "/auth/change",
  () => authChangeReqZ,
  (req, app) => authChange(req, app),
);

async function authChange(req: AuthReq<AuthChangeReqT>, app: App) {
  const { oldPassword, newPassword, token } = req.body;
  const { userId } = verifyTempToken(app.jwt, token);
  const user = await getLoginUser({ id: userId });
  if (!user) badToken();

  if (user.password?.mustChange === false) {
    bad("Password was already changed");
  }

  const data = await checkPasswordChange(oldPassword, newPassword, user);
  const password = await prisma.password.update({ where: { userId }, data });

  await prisma.authLog.create({
    data: {
      action: AuthAction.CHANGE_PASSWORD,
      email: user.email,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });
  await sendSyslog(AuthAction.LOCKOUT, {
    email: user.email,
    ip: req.ip,
  });

  return authResult(app, req, { ...user, password });
}
