import z from "zod";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";

export const unlockApi = postRoute({
  url: "/admin/unlock",
  schema: z.object({ id: z.string() }),
  handler: (req) => unlock(req.body.id),
});

async function unlock(id: string) {
  await prisma.user.update({
    where: { id },
    data: {
      expiredAt: null,
      lastActive: new Date(),
    },
  });
  return { success: true };
}
