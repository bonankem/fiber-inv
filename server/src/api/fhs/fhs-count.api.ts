import { sumBy } from "remeda";
import type { SubsetCounts } from "schema/common";
import { type FhsFilterT, fhsFilterZ } from "schema/fhs";
import { assoc } from "schema/utils";
import { prisma, WorkStatus as S } from "#/prisma";
import { getRoute } from "#/utils";
import { fhsWorkWhere, workNotOpen, workStopped } from "./filter";

export default getRoute(
  "/fhs/count",
  () => fhsFilterZ,
  (req) => fhsCount(req.query),
);

async function fhsCount(input: FhsFilterT): Promise<SubsetCounts> {
  delete input.subset;
  const byStatus = await prisma.work.groupBy({
    where: { fhs: { isNot: null }, ...fhsWorkWhere(input) },
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
