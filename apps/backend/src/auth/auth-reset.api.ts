import { compareSync } from "bcryptjs";
import { type AuthResetReqT, authResetReqZ } from "schema/auth";
import { bad, Err } from "schema/errors";
import { authLog } from "#/admin/adm-syslog.api";
import { AuthAction, prisma } from "#/db";
import { postRoute, type RequestWith } from "#/utils/routing";
import { checkNewPassword, getLoginUser } from "./utils";

export const resetApi = postRoute({
  url: "/auth/reset",
  schema: authResetReqZ,
  handler: (req) => resetPassword(req),
});

function invalidReset(): never {
  bad(Err.RESET_LINK_INVALID);
}

async function resetPassword(req: RequestWith<AuthResetReqT>) {
  const { code, newPassword } = req.body;
  const [key, secret] = code.split(":");
  const now = new Date();

  const db = prisma.passwordReset;
  const reset = await db.findUnique({ where: { key } });
  if (!reset || reset.expiresAt < now) invalidReset();

  const { email, hashed } = reset;
  const valid = compareSync(secret, hashed);
  if (!valid) invalidReset();

  const user = await getLoginUser({ email });
  if (!user) invalidReset();

  const data = await checkNewPassword(newPassword, user);
  await prisma.password.update({ where: { userId: user.id }, data });
  await db.deleteMany({ where: { email } });
  await authLog(AuthAction.CHANGE_PASSWORD, req, user.email);
  return { success: true };
}
