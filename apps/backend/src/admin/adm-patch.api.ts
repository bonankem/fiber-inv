import { Allow } from "#/auth/guard";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";

export const patchApi = postRoute({
  url: "/admin/patch",
  allow: Allow.PUBLIC,
  handler: patch,
});

async function patch() {
  const now = new Date();
  return prisma.user.updateMany({
    where: { isAdmin: true, lastActive: { not: null } },
    data: { expiredAt: null, lastActive: now },
  });
}
