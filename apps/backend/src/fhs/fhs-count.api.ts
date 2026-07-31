import { sumBy } from "remeda";
import type { SubsetCounts } from "schema/common";
import { type FhsFilterT, fhsFilterZ } from "schema/fhs";
import type { UserFullT } from "schema/people";
import { assoc } from "schema/utils";
import { prisma, WorkStatus as S } from "#/db";
import { getRoute } from "#/utils/routing";
import {
  fhsWherePendingOn,
  fhsWorkWhere,
  workNotOpen,
  workStopped,
} from "./filter";

export const fhsCountApi = getRoute({
  url: "/fhs/count",
  schema: fhsFilterZ,
  handler: (req) => fhsCount(req.query, req.authUser),
});

async function fhsCount(
  input: FhsFilterT,
  user: UserFullT,
): Promise<SubsetCounts> {
  delete input.subset;

  const db = prisma.work;
  const fhs = { isNot: null };
  const byStatus = await db.groupBy({
    where: { fhs, AND: fhsWorkWhere(input, user) },
    by: ["status"],
    _count: true,
  });
  const counts = assoc(
    byStatus,
    (s) => s.status,
    (s) => s._count,
  );
  const mine = await prisma.work.count({
    where: { fhs, AND: fhsWherePendingOn(user) },
  });
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
