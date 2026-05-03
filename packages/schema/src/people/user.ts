import {
  type Prisma,
  type Same,
  StaffRole,
  z,
  zObject,
  zStr,
  zStrNul,
} from "../common";
import { vendorP, vendorZ } from "./vendor";

export const userS = {
  id: true,
  name: true,
  email: true,
  phone: true,
  staffRole: true,
  vendor: vendorP,
} satisfies Prisma.UserSelect;

export const userZ = zObject("UserT", {
  id: zStr("The user's UUID"),
  name: zStr("The user's full name"),
  email: zStr("The user's email address"),
  phone: zStrNul("The user's phone number"),
  staffRole: z
    .enum(StaffRole)
    .nullable()
    .describe("The user's role, if they are MTN staff"),
  vendor: vendorZ
    .nullable()
    .describe("Vendor to which the user belongs, if any"),
} satisfies Record<keyof typeof userS, object>);

export const userP = { select: userS };

type UserP = Prisma.UserGetPayload<typeof userP>;
type UserZ = z.infer<typeof userZ>;

export type UserT = Same<UserP, UserZ>;
