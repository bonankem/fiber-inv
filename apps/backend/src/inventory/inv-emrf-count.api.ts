import type { UserFullT } from "schema/people";
import { assoc } from "schema/utils";
import { prisma } from "#/db";
import { getRoute } from "#/utils/routing";
import { emrfAccess } from "./utils";

// counts for the summary cards on the EMRF page, keyed by status plus TOTAL
export const emrfCountApi = getRoute({
  url: "/inventory/emrf/count",
  handler: (req) => emrfCount(req.authUser),
});

async function emrfCount(user: UserFullT) {
  const byStatus = await prisma.emrf.groupBy({
    where: emrfAccess(user),
    by: ["status"],
    _count: true,
  });
  const counts: Record<string, number> = assoc(
    byStatus,
    (s) => s.status,
    (s) => s._count,
  );
  counts.TOTAL = byStatus.reduce((sum, s) => sum + s._count, 0);
  return counts;
}
