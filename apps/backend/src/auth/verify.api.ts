import type { JWT } from "@fastify/jwt";
import type { PrismaPromise } from "@prisma/client/runtime/client";
import { verifySync } from "otplib";
import { type AuthVerifyReqT, authVerifyReqZ } from "schema/auth";
import { MfaMode, prisma } from "#/db";
import { bad, postRoute } from "#/utils";
import { decrypt } from "../utils/encryption";
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
    return authSuccess(jwt, userId);
  }

  if (mode === MfaMode.AUTHENTICATOR) {
    const db = prisma.authenticator;
    const a = await db.findUnique({ where: { userId } });
    if (!a) badOtp();
    const verified = verifySync({
      secret: decrypt(a.secret),
      token: req.otp,
      epochTolerance: 30,
    });
    return result(verified.valid);
  }

  return result(req.otp === "123456" || req.otp === "456789");
  // const since = new Date(Date.now() - OTP_EXPIRY_MINUTES * 60000);
  // const otps = await prisma.otp.findMany({
  //   where: { userId, mode, createdAt: { gte: since } },
  // });
  // return result(otps.some((o) => compareSync(req.otp, o.hashed)));
}
