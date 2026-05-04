import type { FhsFilterT } from "schema/fhs";
import type { UserT } from "schema/people";
import { type Prisma, StaffRole, WorkStatus } from "#/prisma";
import type { Maybe } from "#/utils";
import { filterTruthy, qOr, qSidIs, qWorkerIs } from "../utils/queries";
import { type WorkWhere, workIsOnUser, workIsOnVendor } from "../utils/work";

type Where = Prisma.FtthSurveyWhereInput;
type Who = Pick<UserT, "id" | "vendor">;

const R = StaffRole;
const S = WorkStatus;

export function fhsPendingOn(who: Maybe<Who | string>) {
  if (!who) return undefined;
  const userId = typeof who === "string" ? who : who.id;
  const vendorId = typeof who === "string" ? who : who.vendor?.id;
  return qOr<WorkWhere>([
    workIsOnVendor(vendorId, S.ONGOING, S.REVIEW_FAILED),
    workIsOnUser(S.REQUESTED, R.PLANNING_MANAGER, userId),
    workIsOnUser(S.ASSIGNED, R.PLANNING_ENGINEER, userId),
  ]);
}

export function fhsFilter(input: FhsFilterT): Where {
  return {
    work: {
      sid: qSidIs(input.sid),
      status: input.status,
      vendorId: input.vendor,
      requestDate: input.requested,
      workers: qWorkerIs(input.worker),
      AND: filterTruthy([fhsPendingOn(input.pending)]),
    },
  };
}
