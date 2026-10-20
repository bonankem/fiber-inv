import z from "zod";
import { Allow } from "#/auth/guard";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";

export const patchApi = postRoute({
  url: "/admin/patch",
  allow: Allow.PUBLIC,
  schema: z.object({
    commit: z.boolean().optional(),
    param: z.string().optional(),
  }),
  handler: async () => {
    return prisma.user.updateMany({
      where: { isAdmin: true, expiredAt: { not: null } },
      data: { expiredAt: null },
    });
  },
});
