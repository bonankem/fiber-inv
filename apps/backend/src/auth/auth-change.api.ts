import { type AuthChangeReqT, authChangeReqZ } from "schema/auth";
import { authLog } from "#/admin/adm-syslog.api";
import { AuthAction, prisma } from "#/db";
import { bad } from "#/utils/errors";
import { type App, postRoute, type RequestWith } from "#/utils/routing";
import {
  authResult,
  badToken,
  checkPasswordChange,
  getLoginUser,
  verifyTempToken,
} from "./utils";

export const changeApi = postRoute({
  url: "/auth/change",
  schema: authChangeReqZ,
  handler: (req, app) => authChange(req, app),
});

async function authChange(req: RequestWith<AuthChangeReqT>, app: App) {
  const { oldPassword, newPassword, token } = req.body;
  const { userId } = verifyTempToken(app.jwt, token);
  const user = await getLoginUser({ id: userId });
  if (!user) badToken();

  if (user.password?.mustChange === false) {
    bad("Password was already changed");
  }

  const data = await checkPasswordChange(oldPassword, newPassword, user);
  const password = await prisma.password.update({ where: { userId }, data });

  await authLog(AuthAction.CHANGE_PASSWORD, req, user.email);

  return authResult(app, req, { ...user, password });
}
