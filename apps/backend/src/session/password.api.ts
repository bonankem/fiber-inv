import { AuthAction, MfaMode, OtpReason } from "schema/enums";
import {
  type SessionPasswordReqT,
  type SessionPasswordResT,
  sessionPasswordReqZ,
} from "schema/session";
import { sendSyslog } from "#/admin/syslog.api";
import {
  checkOtp,
  checkPasswordChange,
  deliverOtp,
  getLoginUser,
} from "#/auth/utils";
import { prisma } from "#/db";
import { type AnyRequest, postRoute, unauthorized } from "#/utils";

export default postRoute(
  "/session/password",
  () => sessionPasswordReqZ,
  (req) => changePassword(req),
);

type Req = AnyRequest & {
  body: SessionPasswordReqT;
};

async function changePassword(req: Req): Promise<SessionPasswordResT> {
  const user = await getLoginUser({ id: req.authIds.userId });
  if (!user) unauthorized();

  const data = await checkPasswordChange(
    req.body.oldPassword,
    req.body.newPassword,
    user,
  );

  const mfa = user.password?.mfaMode ?? MfaMode.NONE;
  if (mfa !== MfaMode.NONE) {
    const otp = req.body.otp;
    if (!otp) {
      deliverOtp(mfa, user, OtpReason.CHANGE_PASSWORD);
      return { needsOtp: mfa };
    }
    await checkOtp(user.id, otp, mfa);
  }

  await prisma.password.update({
    where: { userId: user.id },
    data,
  });
  await prisma.authLog.create({
    data: {
      action: AuthAction.CHANGE_PASSWORD,
      email: user.email,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });
  await sendSyslog(AuthAction.CHANGE_PASSWORD, {
    email: user.email,
    ip: req.ip,
  });
  return { needsOtp: MfaMode.NONE };
}
