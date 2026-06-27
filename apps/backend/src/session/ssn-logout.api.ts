import { authLog } from "#/admin/adm-syslog.api";
import { AuthAction, prisma } from "#/db";
import { bad } from "#/utils/errors";
import { type AnyRequest, postRoute } from "#/utils/routing";

export const logoutApi = postRoute({
  url: "/session/logout",
  handler: logout,
});

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
