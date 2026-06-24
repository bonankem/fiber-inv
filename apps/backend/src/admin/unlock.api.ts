import z from "zod";
import { prisma } from "#/db";
import { postRoute, type RequestWith } from "#/utils";

export const unlockApi = postRoute(
  "/admin/unlock",
  () => z.object({ id: z.string() }),
  (req) => unlock(req),
);

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
