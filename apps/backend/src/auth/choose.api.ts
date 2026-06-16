import type { JWT } from "@fastify/jwt";
import { type AuthChooseReqT, authChooseReqZ } from "schema/auth";
import { MfaMode, prisma } from "#/db";
import { bad, postRoute } from "#/utils";
import {
  type AuthReq,
  authResult,
  badToken,
  getLoginUser,
  verifyTempToken,
} from "./utils";

export default postRoute(
  "/auth/choose",
  () => authChooseReqZ,
  (req, app) => authChoose(req, app.jwt),
);

async function authChoose(req: AuthReq<AuthChooseReqT>, jwt: JWT) {
  const { userId } = verifyTempToken(jwt, req.body.token);
  const mfaMode = req.body.mode;

  const user = await getLoginUser({ id: userId });
  if (!user?.password) badToken();

  const p = user.password || badToken();
  const oldMode = p.mfaMode;

  if (oldMode === mfaMode) {
    return authResult(jwt, req, user, true);
  }

  if (oldMode !== MfaMode.UNDECIDED && p.mfaVerified) {
    // cannot call this endpoint when MFA mode is already verified
    bad(`MFA mode is already set to ${oldMode}`);
  }

  user.password = await prisma.password.update({
    where: { userId },
    data: { mfaMode, mfaVerified: false },
  });
  return authResult(jwt, req, user, true);
}
