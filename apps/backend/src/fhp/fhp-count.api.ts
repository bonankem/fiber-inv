import { sumBy } from "remeda";
import type { SubsetCounts } from "schema/common";
import { type FhpFilterT, fhpFilterZ } from "schema/fhp";
import { assoc } from "schema/utils";
import { prisma, WorkStatus as S } from "#/db";
import { getRoute } from "#/utils";
import { workNotOpen, workStopped, workWhere } from "./filter";

export const fhpCountApi = getRoute(
  "/fhp/count",
  () => fhpFilterZ,
  (req) => fhpCount(req.query),
);

async function fhpCount(input: FhpFilterT): Promise<SubsetCounts> {
  delete input.subset;
  const byStatus = await prisma.work.groupBy({
    where: { fhp: { isNot: null }, ...workWhere(input) },
    by: ["status"],
    _count: true,
  });
  const counts = assoc(
    byStatus,
    (s) => s.status,
    (s) => s._count,
  );
  const countOf = (statuses: S[]) => {
    return sumBy(statuses, (s) => counts[s] || 0);
  };

  const total = sumBy(byStatus, (s) => s._count);
  return {
    TOTAL: total,
    MY_PENDING: 0,
    OPEN: total - countOf(workNotOpen),
    STOPPED: countOf(workStopped),
    CLOSED: countOf([S.CLOSED]),
  };
}
