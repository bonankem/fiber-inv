import { sumBy } from "remeda";
import type { SubsetCounts } from "schema/common";
import { type FhcFilterT, fhcFilterZ } from "schema/fhc";
import type { UserFullT } from "schema/people";
import { assoc } from "schema/utils";
import { prisma, WorkStatus as S } from "#/db";
import { getRoute } from "#/utils";
import { fhcWorkWhere, workNotOpen, workStopped } from "./filter";

export default getRoute(
  "/fhc/count",
  () => fhcFilterZ,
  (req) => fhcCount(req.query, req.authUser),
);

async function fhcCount(
  input: FhcFilterT,
  user: UserFullT,
): Promise<SubsetCounts> {
  delete input.subset;
  const byStatus = await prisma.work.groupBy({
    where: {
      fhc: { isNot: null },
      AND: fhcWorkWhere(input, user),
    },
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
