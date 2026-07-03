import { type AuthChooseReqT, authChooseReqZ } from "schema/auth";
import { bad, Err } from "schema/errors";
import { MfaMode, prisma } from "#/db";
import { type App, postRoute, type RequestWith } from "#/utils/routing";
import { authResult, getLoginUser, loginUserS, verifyTempToken } from "./utils";

export const chooseApi = postRoute({
  url: "/auth/choose",
  schema: authChooseReqZ,
  handler: (req, app) => authChoose(req, app),
});

async function authChoose(req: RequestWith<AuthChooseReqT>, app: App) {
  const { userId } = verifyTempToken(app.jwt, req.body.token);
  const mfaMode = req.body.mode;

  const user = await getLoginUser({ id: userId });
  if (!user) bad(Err.INVALID_TOKEN);

  if (user.mfaMode === mfaMode) {
    return authResult(app, req, user, true);
  }

  if (user.mfaMode !== MfaMode.UNDECIDED && user.mfaVerified) {
    bad(Err.MFA_ALREADY_SET);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { mfaMode, mfaVerified: false },
    select: loginUserS,
  });
  return authResult(app, req, updated, true);
}
