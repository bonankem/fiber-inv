import { MfaMode, OtpReason } from "schema/enums";
import {
  type SessionPasswordReqT,
  type SessionPasswordResT,
  sessionPasswordReqZ,
} from "schema/session";
import {
  checkOtp,
  checkPasswordChange,
  deliverOtp,
  getLoginUser,
} from "#/auth/utils";
import { prisma } from "#/db";
import { postRoute, unauthorized } from "#/utils";

export default postRoute(
  "/session/password",
  () => sessionPasswordReqZ,
  (req) => changePassword(req.body, req.authIds.userId),
);

async function changePassword(
  req: SessionPasswordReqT,
  userId: string,
): Promise<SessionPasswordResT> {
  const user = await getLoginUser({ id: userId });
  if (!user) unauthorized();

  const data = await checkPasswordChange(
    req.oldPassword,
    req.newPassword,
    user,
  );

  const mfa = user.password?.mfaMode ?? MfaMode.NONE;
  if (mfa !== MfaMode.NONE) {
    const otp = req.otp;
    if (!otp) {
      deliverOtp(mfa, user, OtpReason.CHANGE_PASSWORD);
      return { needsOtp: mfa };
    }
    await checkOtp(user.id, otp, mfa);
  }

  await prisma.password.update({ where: { userId }, data });
  return { needsOtp: MfaMode.NONE };
}
