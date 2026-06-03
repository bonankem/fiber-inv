import type { UserFullT } from "schema/people";
import { type Maybe, whereNone } from "schema/utils";
import type { Prisma } from "#/db";

type Where = Prisma.WorkWhereInput | undefined;

export function workAccess(user: Maybe<UserFullT>): Where {
  if (!user) return whereNone;
  if (user.isAdmin || user.staffRole) return undefined;
  if (user.vendor) return { vendorId: user.vendor.id };
  return whereNone;
}
