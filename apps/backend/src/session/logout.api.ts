import { prisma } from "#/db";
import { type AnyRequest, postRoute, unauthorized } from "#/utils";

export default postRoute("/session/logout", null, (req) => logout(req));

async function logout(req: AnyRequest) {
  const expiresAt = { lte: new Date() };
  const { sessionId, userId } = req.authIds || unauthorized();

  const { count } = await prisma.session.deleteMany({
    where: { userId, OR: [{ id: sessionId }, { expiresAt }] },
  });
  if (count > 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (user) {
      await prisma.authLog.create({
        data: {
          action: "LOGOUT",
          email: user.email,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"] || "",
        },
      });
    }
  }

  return { success: true };
}
