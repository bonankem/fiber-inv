import { authLog } from "#/admin/syslog.api";
import { AuthAction, prisma } from "#/db";
import { type AnyRequest, bad, postRoute } from "#/utils";

export const logoutApi = postRoute("/session/logout", null, (req) =>
  logout(req),
);

async function logout(req: AnyRequest) {
  const expiresAt = { lte: new Date() };
  const { sessionId, userId } = req.authIds;

  const { count } = await prisma.session.deleteMany({
    where: { userId, OR: [{ id: sessionId }, { expiresAt }] },
  });
  if (count === 0) bad("Invalid session");

  await authLog(AuthAction.LOGOUT, req, req.authUser.email);
  return { success: true };
}
