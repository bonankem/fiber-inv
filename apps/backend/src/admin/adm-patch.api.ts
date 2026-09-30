import { Allow } from "#/auth/guard";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";

export const patchApi = postRoute({
  url: "/admin/patch",
  allow: Allow.PUBLIC,
  handler: patch,
});

async function patch() {
  const corrected = await prisma.work.updateMany({
    where: { fhs: { isNot: null }, status: "SURVEY" },
    data: { status: "TALLYING" },
  });
  const logs = await prisma.workLog.updateMany({
    where: { work: { fhs: { isNot: null } }, newStatus: "SURVEY" },
    data: { newStatus: "TALLYING" },
  });
  return {
    corrected: corrected.count,
    logs: logs.count,
  };
}
