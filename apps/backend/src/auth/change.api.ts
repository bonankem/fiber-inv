import { type AuthChangeReqT, authChangeReqZ } from "schema/auth";
import { prisma } from "#/db";
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
  return authResult(app, req, { ...user, password });
}
