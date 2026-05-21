import { Subset } from "schema/common";
import type { FhsFilterT } from "schema/fhs";
import type { UserT } from "schema/people";
import { whereNone } from "schema/utils";
import { type Prisma, StaffRole, WorkStatus } from "#/prisma";
import type { Maybe } from "#/utils";
import { filterTruthy, qOr, qSidIs, qWorkerIs } from "../utils/queries";
import { type WorkWhere, workIsOnUser, workIsOnVendor } from "../utils/work";

type Who = Pick<UserT, "id" | "vendor">;
type Where = Prisma.FtthSurveyWhereInput;
type WhereWork = Where["work"];

const R = StaffRole;
const S = WorkStatus;
export const workStopped: WorkStatus[] = [S.CANCELLED, S.DECLINED];
export const workNotOpen: WorkStatus[] = [S.CLOSED, ...workStopped];

export function fhsWherePendingOn(who: Maybe<Who | string>) {
  if (!who) return undefined;
  const userId = typeof who === "string" ? who : who.id;
  const vendorId = typeof who === "string" ? who : who.vendor?.id;
  return qOr<WorkWhere>([
    workIsOnVendor(vendorId, S.ONGOING, S.REVIEW_FAILED),
    workIsOnUser(S.REQUESTED, R.PLANNING_MANAGER, userId),
    workIsOnUser(S.ASSIGNED, R.PLANNING_ENGINEER, userId),
  ]);
}

export function fhsWhereSubset(s: Maybe<Subset>): WhereWork {
  if (s === Subset.TOTAL || !s) return undefined;
  if (s === Subset.CLOSED) return { status: S.CLOSED };
  if (s === Subset.STOPPED) return { status: { in: workStopped } };
  if (s === Subset.OPEN) return { status: { notIn: workNotOpen } };
  return whereNone;
}

export function fhsWorkWhere(input: FhsFilterT): WhereWork {
  return {
    sid: qSidIs(input.sid),
    status: input.status,
    vendorId: input.vendor,
    requestDate: input.requested,
    workers: qWorkerIs(input.worker),
    AND: filterTruthy([
      fhsWherePendingOn(input.pending),
      fhsWhereSubset(input.subset),
    ]),
  };
}
