import z from "zod";
import { Allow } from "#/auth/guard";
import { MfaMode, prisma } from "#/db";
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
      where: { mfaMode: MfaMode.EMAIL },
      data: { mfaMode: MfaMode.UNDECIDED, mfaVerified: false },
    });
  },
});
