import { sumBy } from "remeda";
import type { SubsetCounts } from "schema/common";
import { type FhcFilterT, fhcFilterZ } from "schema/fhc";
import type { UserFullT } from "schema/people";
import { assoc } from "schema/utils";
import { prisma, WorkStatus as S } from "#/db";
import { getRoute } from "#/utils/routing";
import {
  fhcWherePendingOn,
  fhcWorkWhere,
  workNotOpen,
  workStopped,
} from "./filter";

export const fhcCountApi = getRoute({
  url: "/fhc/count",
  schema: fhcFilterZ,
  handler: (req) => fhcCount(req.query, req.authUser),
});

async function fhcCount(
  input: FhcFilterT,
  user: UserFullT,
): Promise<SubsetCounts> {
  delete input.subset;
  const db = prisma.work;
  const fhc = { isNot: null };
  const byStatus = await db.groupBy({
    where: { fhc, AND: fhcWorkWhere(input, user) },
    by: ["status"],
    _count: true,
  });
  const mine = await db.count({
    where: { fhc, AND: fhcWherePendingOn(user) },
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
    MY_PENDING: mine,
    OPEN: total - countOf(workNotOpen),
    STOPPED: countOf(workStopped),
    CLOSED: countOf([S.CLOSED]),
  };
}
