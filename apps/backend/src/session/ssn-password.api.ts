import { AuthAction, MfaMode, OtpReason } from "schema/enums";
import {
  type SessionPasswordReqT,
  type SessionPasswordResT,
  sessionPasswordReqZ,
} from "schema/session";
import { authLog } from "#/admin/adm-syslog.api";
import {
  checkOtp,
  checkPasswordChange,
  deliverOtp,
  getLoginUser,
} from "#/auth/utils";
import { prisma } from "#/db";
import { unauthorized } from "#/utils/errors";
import { type AnyRequest, postRoute } from "#/utils/routing";

export const passwordApi = postRoute({
  url: "/session/password",
  schema: sessionPasswordReqZ,
  handler: changePassword,
});

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
  const userId = user.id;

  const mfa = user.password?.mfaMode;
  if (mfa && mfa !== MfaMode.NONE) {
    const otp = req.body.otp;
    if (!otp) {
      deliverOtp(mfa, user, OtpReason.CHANGE_PASSWORD);
      return { needsOtp: mfa };
    }
    await checkOtp(userId, otp, mfa);
  }

  await prisma.password.update({ where: { userId }, data });
  await authLog(AuthAction.CHANGE_PASSWORD, req, user.email);
  return { needsOtp: MfaMode.NONE };
}
