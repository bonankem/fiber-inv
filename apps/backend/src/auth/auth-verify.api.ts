import { type AuthVerifyReqT, authVerifyReqZ } from "schema/auth";
import { bad, Err } from "schema/errors";
import { MfaMode, prisma } from "#/db";
import { type App, postRoute, type RequestWith } from "#/utils/routing";
import { authSuccess, checkOtp, getLoginUser, verifyTempToken } from "./utils";

export const verifyApi = postRoute({
  url: "/auth/verify",
  schema: authVerifyReqZ,
  handler: (req, app) => authVerify(req, app),
});

async function authVerify(req: RequestWith<AuthVerifyReqT>, app: App) {
  const { userId: id } = verifyTempToken(app.jwt, req.body.token);
  const { otp, mode } = req.body;

  const user = await getLoginUser({ id });
  if (!user) bad(Err.INVALID_TOKEN);
  await checkOtp(id, otp, mode);

  const verifiedNow = user.mfaVerified === false;
  const usedAuthApp = mode === MfaMode.AUTHENTICATOR;
  const installedNow = usedAuthApp && !user.authenticator?.installed;

  await prisma.user.update({
    where: { id },
    data: {
      mfaMode: verifiedNow ? mode : undefined,
      mfaVerified: verifiedNow ? true : undefined,
      authenticator: installedNow ? { update: { installed: true } } : undefined,
      otps: { deleteMany: {} },
    },
  });
  return authSuccess(app, req, id);
}
