import type { PrismaPromise } from "@prisma/client/runtime/client";
import { type AuthVerifyReqT, authVerifyReqZ } from "schema/auth";
import { MfaMode, prisma } from "#/db";
import { type App, postRoute } from "#/utils";
import {
  type AuthReq,
  authSuccess,
  badToken,
  checkOtp,
  getLoginUser,
  verifyTempToken,
} from "./utils";

export default postRoute(
  "/auth/verify",
  () => authVerifyReqZ,
  (req, app) => authVerify(req, app),
);

async function authVerify(req: AuthReq<AuthVerifyReqT>, app: App) {
  const { userId } = verifyTempToken(app.jwt, req.body.token);
  const { otp, mode } = req.body;

  const user = (await getLoginUser({ id: userId })) || badToken();
  await checkOtp(userId, otp, mode);

  const actions: PrismaPromise<unknown>[] = [];
  actions.push(prisma.otp.deleteMany({ where: { userId } }));

  if (user.password?.mfaVerified === false) {
    actions.push(
      prisma.password.update({
        where: { userId },
        data: { mfaMode: mode, mfaVerified: true },
      }),
    );
  }

  if (mode === MfaMode.AUTHENTICATOR) {
    actions.push(
      prisma.authenticator.update({
        where: { userId },
        data: { installed: true },
      }),
    );
  }

  await prisma.$transaction(actions);
  return authSuccess(app, req, userId);
}
