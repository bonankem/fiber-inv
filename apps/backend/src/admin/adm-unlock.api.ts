import z from "zod";
import { prisma } from "#/db";
import { postRoute, type RequestWith } from "#/utils/routing";

export const unlockApi = postRoute({
  url: "/admin/unlock",
  schema: z.object({ id: z.string() }),
  handler: (req) => unlock(req),
});

async function unlock(req: RequestWith<{ id: string }>) {
  const now = new Date();
  await prisma.user.update({
    where: { id: req.body.id },
    data: {
      expiredAt: null,
      lastActive: now,
    },
  });
  return { success: true };
}
