import { sumBy } from "remeda";
import type { SubsetCounts } from "schema/common";
import { type FhpFilterT, fhpFilterZ } from "schema/fhp";
import type { UserFullT } from "schema/people";
import { assoc } from "schema/utils";
import { prisma, WorkStatus as S } from "#/db";
import { getRoute } from "#/utils/routing";
import {
  fhpWherePendingOn,
  workNotOpen,
  workStopped,
  workWhere,
} from "./filter";

export const fhpCountApi = getRoute({
  url: "/fhp/count",
  schema: fhpFilterZ,
  handler: (req) => fhpCount(req.query, req.authUser),
});

async function fhpCount(
  input: FhpFilterT,
  user: UserFullT,
): Promise<SubsetCounts> {
  delete input.subset;

  const db = prisma.work;
  const fhp = { isNot: null };
  const byStatus = await db.groupBy({
    where: { fhp, AND: workWhere(input) },
    by: ["status"],
    _count: true,
  });
  const mine = await db.count({
    where: { fhp, AND: fhpWherePendingOn(user) },
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
