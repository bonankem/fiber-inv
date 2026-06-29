import { type AuthChooseReqT, authChooseReqZ } from "schema/auth";
import { bad, Err } from "schema/errors";
import { MfaMode, prisma } from "#/db";
import { type App, postRoute, type RequestWith } from "#/utils/routing";
import { authResult, getLoginUser, verifyTempToken } from "./utils";

export const chooseApi = postRoute({
  url: "/auth/choose",
  schema: authChooseReqZ,
  handler: (req, app) => authChoose(req, app),
});

async function authChoose(req: RequestWith<AuthChooseReqT>, app: App) {
  const { userId } = verifyTempToken(app.jwt, req.body.token);
  const mfaMode = req.body.mode;

  const user = await getLoginUser({ id: userId });
  if (!user?.password) bad(Err.INVALID_TOKEN);

  const p = user.password || bad(Err.INVALID_TOKEN);
  const oldMode = p.mfaMode;

  if (oldMode === mfaMode) {
    return authResult(app, req, user, true);
  }

  if (oldMode !== MfaMode.UNDECIDED && p.mfaVerified) {
    bad(Err.INVALID_LOGIN);
  }

  user.password = await prisma.password.update({
    where: { userId },
    data: { mfaMode, mfaVerified: false },
  });
  return authResult(app, req, user, true);
}
