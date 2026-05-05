import type { Prisma, StaffRole, WorkStatus } from "#/prisma";
import type { Maybe } from "#/utils";

export type WorkWhere = Prisma.WorkWhereInput;

export function workIsOnUser(
  status: WorkStatus,
  role: StaffRole,
  userId: string,
): WorkWhere {
  return { status, workers: { some: { userId, role } } };
}

export function workIsOnVendor(
  vendorId: Maybe<string>,
  ...statuses: WorkStatus[]
): WorkWhere | undefined {
  if (!vendorId || !statuses.length) return undefined;
  return { vendorId, status: { in: statuses } };
}
