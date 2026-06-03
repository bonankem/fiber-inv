import { prisma } from "#/db";
import { postRoute, unauthorized } from "#/utils";
import type { AuthIdsT } from "./utils";

export default postRoute("/auth/logout", null, (req) =>
  logout(req.authIds || unauthorized()),
);

async function logout({ sessionId: id, userId }: AuthIdsT) {
  const expiry = { lte: new Date() };
  await prisma.session.deleteMany({
    where: { userId, OR: [{ id }, { expiry }] },
  });
  return { success: true };
}
