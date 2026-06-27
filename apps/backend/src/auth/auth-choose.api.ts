import { type AuthChooseReqT, authChooseReqZ } from "schema/auth";
import { MfaMode, prisma } from "#/db";
import { bad } from "#/utils/errors";
import { type App, postRoute, type RequestWith } from "#/utils/routing";
import { authResult, badToken, getLoginUser, verifyTempToken } from "./utils";

export const chooseApi = postRoute({
  url: "/auth/choose",
  schema: authChooseReqZ,
  handler: (req, app) => authChoose(req, app),
});

async function authChoose(req: RequestWith<AuthChooseReqT>, app: App) {
  const { userId } = verifyTempToken(app.jwt, req.body.token);
  const mfaMode = req.body.mode;

  const user = await getLoginUser({ id: userId });
  if (!user?.password) badToken();

  const p = user.password || badToken();
  const oldMode = p.mfaMode;

  if (oldMode === mfaMode) {
    return authResult(app, req, user, true);
  }

  if (oldMode !== MfaMode.UNDECIDED && p.mfaVerified) {
    // cannot call this endpoint when MFA mode is already verified
    bad(`MFA mode is already set to ${oldMode}`);
  }

  user.password = await prisma.password.update({
    where: { userId },
    data: { mfaMode, mfaVerified: false },
  });
  return authResult(app, req, user, true);
}
