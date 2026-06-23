import { sendSyslog } from "#/admin/syslog";
import { AuthAction, prisma } from "#/db";
import { type AnyRequest, bad, postRoute } from "#/utils";

export default postRoute("/session/logout", null, (req) => logout(req));

async function logout(req: AnyRequest) {
  const expiresAt = { lte: new Date() };
  const { sessionId, userId } = req.authIds;

  const { count } = await prisma.session.deleteMany({
    where: { userId, OR: [{ id: sessionId }, { expiresAt }] },
  });
  if (count === 0) bad("Invalid session");

  const email = req.authUser.email;
  await prisma.authLog.create({
    data: {
      action: AuthAction.LOCKOUT,
      email,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || "",
    },
  });
  await sendSyslog(AuthAction.LOGOUT, { email, ip: req.ip });

  return { success: true };
}
