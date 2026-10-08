import { randomBytes } from "node:crypto";
import { hashSync } from "bcryptjs";
import { bad, Err } from "schema/errors";
import z from "zod";
import { Allow } from "#/auth/guard";
import { MfaMode, prisma } from "#/db";
import { postRoute } from "#/utils/routing";

export const reauthApi = postRoute({
  url: "/admin/reauth",
  allow: Allow.ADMIN,
  schema: z.object({
    email: z.email(),
    dryRun: z.boolean().optional(),
  }),
  handler: async (req) => {
    const user = await prisma.user.findFirst({
      where: { email: req.body.email },
      select: { id: true, email: true, mfaMode: true, mfaVerified: true },
    });
    if (!user) bad(Err.NOT_FOUND);
    if (req.body.dryRun) return user;

    const password = randomBytes(9).toString("base64");
    const hashed = hashSync(password);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: { update: { hashed, history: [hashed], mustChange: true } },
        mfaMode: MfaMode.UNDECIDED,
        mfaVerified: false,
      },
      select: { id: true, email: true, mfaMode: true, mfaVerified: true },
    });
    return { ...updated, password };
  },
});
