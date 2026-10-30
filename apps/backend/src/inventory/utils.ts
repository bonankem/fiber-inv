import type { UserFullT } from "schema/people";
import type { Prisma } from "#/db";
import { workAccess } from "../work/filter";

/** Vendors see only the EMRFs of their own projects; staff see them all. */
export function emrfAccess(user: UserFullT): Prisma.EmrfWhereInput {
  const access = workAccess(user);
  return access ? { survey: { work: access } } : {};
}
