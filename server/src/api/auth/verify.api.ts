import type { JWT } from "@fastify/jwt";
import { compareSync } from "bcryptjs";
import { verifySync } from "otplib";
import { type AuthVerifyReqT, authVerifyReqZ } from "schema/auth";
import { MfaMode, prisma } from "#/prisma";
import { bad, postRoute } from "#/utils";
import { decrypt } from "../utils/encryption";
import { OTP_EXPIRY_MINUTES } from "./config";
import { authSuccess, badToken, getLoginUser, verifyTempToken } from "./utils";

export default postRoute(
  "/auth/verify",
  () => authVerifyReqZ,
  (req, app) => authVerify(req.body, app.jwt),
);

function badOtp(): never {
  bad("Incorrect or expired OTP");
}

async function authVerify(req: AuthVerifyReqT, jwt: JWT) {
  const { userId } = verifyTempToken(jwt, req.token);
  const mode = req.mode;

  const user = (await getLoginUser({ id: userId })) || badToken();

  async function result(valid: boolean) {
    if (!valid) badOtp();
    await prisma.otp.deleteMany({ where: { userId } });

    if (user.password?.mfaVerified === false) {
      await prisma.password.update({
        where: { userId },
        data: { mfaMode: mode, mfaVerified: true },
      });
    }

    return authSuccess(jwt, userId);
  }

  if (mode === MfaMode.AUTHENTICATOR) {
    const db = prisma.authenticator;
    const a = (await db.findUnique({ where: { userId } })) || badOtp();
    const secret = decrypt(a.secret);
    return result(verifySync({ secret, token: req.otp }).valid);
  }

  const since = new Date(Date.now() - OTP_EXPIRY_MINUTES * 60000);
  const otps = await prisma.otp.findMany({
    where: { userId, mode, createdAt: { gte: since } },
  });
  return result(otps.some((o) => compareSync(req.otp, o.hashed)));
}
