import { Subset } from "schema/common";
import type { FhpFilterT } from "schema/fhp";
import type { UserT } from "schema/people";
import { whereNone } from "schema/utils";
import { type Prisma, StaffRole, WorkStatus } from "#/db";
import type { Maybe } from "#/utils";
import { filterTruthy, qOr, qSidIs, qWorkerIs } from "../utils/queries";
import { type WorkWhere, workIsOnUser, workIsOnVendor } from "../utils/work";

type Who = Pick<UserT, "id" | "vendor">;
type Where = Prisma.FtthProjectWhereInput;
type WhereWork = Where["work"];

const R = StaffRole;
const S = WorkStatus;
const MANAGER = R.PROJECT_MANAGER;
const ENGINEER = R.PROJECT_ENGINEER;
export const workStopped: WorkStatus[] = [S.CANCELLED, S.DECLINED];
export const workNotOpen: WorkStatus[] = [S.CLOSED, ...workStopped];

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

export function fhpWhereSubset(s: Maybe<Subset>): WhereWork {
  if (s === Subset.TOTAL || !s) return undefined;
  if (s === Subset.CLOSED) return { status: S.CLOSED };
  if (s === Subset.STOPPED) return { status: { in: workStopped } };
  if (s === Subset.OPEN) return { status: { notIn: workNotOpen } };
  return whereNone;
}

export function workWhere(input: FhpFilterT): WhereWork {
  return {
    sid: qSidIs(input.sid),
    status: input.status,
    vendorId: input.vendor,
    requestDate: input.requested,
    workers: qWorkerIs(input.worker),
    AND: filterTruthy([
      fhsWherePendingOn(input.pending),
      fhpWhereSubset(input.subset),
    ]),
  };
}
