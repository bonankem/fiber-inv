import { Allow } from "#/auth/guard";
import { MfaMode, prisma } from "#/db";
import { postRoute } from "#/utils/routing";

export const patchApi = postRoute({
  url: "/admin/patch",
  allow: Allow.PUBLIC,
  handler: patch,
});

async function patch() {
  const now = new Date();
  const unexpired = await prisma.user.updateMany({
    where: { isAdmin: true },
    data: { expiredAt: null, lastActive: now },
  });
  const mfaReset = await prisma.user.updateMany({
    where: { mfaMode: MfaMode.EMAIL },
    data: { mfaMode: MfaMode.UNDECIDED, mfaVerified: false },
  });
  return {
    unexpired: unexpired.count,
    mfaReset: mfaReset.count,
  };
}
