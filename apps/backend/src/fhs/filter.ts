import { Subset } from "schema/common";
import type { FhsFilterT } from "schema/fhs";
import type { UserFullT } from "schema/people";
import { type Maybe, whereNone } from "schema/utils";
import { type Prisma, StaffRole, WorkStatus } from "#/db";
import { filterTruthy, qOr, qSidIs, qWorkerIs } from "../utils/queries";
import { type WorkWhere, workIsOnUser, workIsOnVendor } from "../utils/work";
import { workAccess } from "../work/filter";

type Who = UserFullT;
type Where = Prisma.FtthSurveyWhereInput;
type WhereWork = Where["work"];

const R = StaffRole;
const S = WorkStatus;
const MANAGER = R.PLANNING_MANAGER;
const ENGINEER = R.PLANNING_ENGINEER;

export function fhsWherePendingOn(who: Maybe<Who | string>) {
  if (!who) return undefined;
  const userId = typeof who === "string" ? who : who.id;
  const vendorId = typeof who === "string" ? who : who.vendor?.id;
  return qOr<WorkWhere>([
    workIsOnVendor(vendorId, S.ONGOING, S.REVIEW_FAILED),
    workIsOnUser(S.REQUESTED, MANAGER, userId),
    workIsOnUser(S.ASSIGNED, ENGINEER, userId),
    workIsOnUser(S.REVIEW, ENGINEER, userId),
  ]);
}

export const workStopped: WorkStatus[] = [S.CANCELLED, S.DECLINED];
export const workNotOpen: WorkStatus[] = [S.CLOSED, ...workStopped];
export function fhsWhereSubset(s: Maybe<Subset>, who?: Who): WhereWork {
  if (s === Subset.TOTAL || !s) return undefined;
  if (s === Subset.CLOSED) return { status: S.CLOSED };
  if (s === Subset.STOPPED) return { status: { in: workStopped } };
  if (s === Subset.OPEN) return { status: { notIn: workNotOpen } };
  if (s === Subset.MY_PENDING) return fhsWherePendingOn(who);
  return whereNone;
}

export function fhsWorkWhere(input: FhsFilterT, who?: Who): WhereWork {
  return {
    sid: qSidIs(input.sid),
    status: input.status,
    vendorId: input.vendor,
    requestDate: input.requested,
    workers: qWorkerIs(input.worker),
    AND: filterTruthy([
      fhsWherePendingOn(input.pending),
      fhsWhereSubset(input.subset, who),
      workAccess(who),
    ]),
  };
}
