import type { JWT } from "@fastify/jwt";
import { type AuthChooseReqT, authChooseReqZ } from "schema/auth";
import { MfaMode, prisma } from "#/db";
import { bad, postRoute } from "#/utils";
import { authResult, badToken, getLoginUser, verifyTempToken } from "./utils";

export default postRoute(
  "/auth/choose",
  () => authChooseReqZ,
  (req, app) => authChoose(req.body, app.jwt),
);

async function authChoose(req: AuthChooseReqT, jwt: JWT) {
  const { userId } = verifyTempToken(jwt, req.token);
  const mfaMode = req.mode;

  const user = await getLoginUser({ id: userId });
  if (!user?.password) badToken();

  const p = user.password || badToken();
  const oldMode = p.mfaMode;

  if (oldMode === mfaMode) {
    return authResult(jwt, user, true);
  }

  if (oldMode !== MfaMode.UNDECIDED && p.mfaVerified) {
    // cannot call this endpoint when MFA mode is already verified
    bad(`MFA mode is already set to ${oldMode}`);
  }

  user.password = await prisma.password.update({
    where: { userId },
    data: { mfaMode, mfaVerified: false },
  });
  return authResult(jwt, user, true);
}
