import { Subset } from "schema/common";
import type { FhcFilterT } from "schema/fhc";
import type { UserFullT } from "schema/people";
import { type Maybe, whereNone } from "schema/utils";
import { type Prisma, WorkStatus } from "#/db";
import { filterTruthy, qOr, qSidIs } from "../utils/queries";
import { type WorkWhere, workIsOnVendor } from "../utils/work";
import { workAccess } from "../work/filter";

type Who = UserFullT;
type Where = Prisma.FtthConnectionWhereInput;
type WhereWork = Where["work"];

const S = WorkStatus;

export function fhcWherePendingOn(who: Maybe<Who | string>) {
  if (!who) return undefined;
  const vendorId = typeof who === "string" ? who : who.vendor?.id;
  return qOr<WorkWhere>([
    workIsOnVendor(
      vendorId,
      S.REQUESTED,
      S.SURVEY,
      S.INSTALLATION,
      S.FAILED_REVIEW,
    ),
  ]);
}

export const workStopped: WorkStatus[] = [S.CANCELLED, S.DECLINED];
export const workNotOpen: WorkStatus[] = [S.CLOSED, ...workStopped];
export function fhcWhereSubset(s: Maybe<Subset>, who?: Who): WhereWork {
  if (s === Subset.TOTAL || !s) return undefined;
  if (s === Subset.CLOSED) return { status: S.CLOSED };
  if (s === Subset.STOPPED) return { status: { in: workStopped } };
  if (s === Subset.OPEN) return { status: { notIn: workNotOpen } };
  if (s === Subset.MY_PENDING) return fhcWherePendingOn(who);
  return whereNone;
}

export function fhcWorkWhere(input: FhcFilterT, who?: Who): WhereWork {
  return {
    sid: qSidIs(input.sid),
    name: input.name
      ? { contains: input.name, mode: "insensitive" }
      : undefined,
    status: input.status,
    vendorId: input.vendor,
    requestDate: input.requested,
    AND: filterTruthy([
      fhcWherePendingOn(input.pending),
      fhcWhereSubset(input.subset, who),
      workAccess(who),
    ]),
  };
}

export function fhcWhere(input: FhcFilterT, who?: Who): Where {
  return { work: fhcWorkWhere(input, who) };
}
