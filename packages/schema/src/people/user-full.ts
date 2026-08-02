import { type Prisma, StaffRole } from "../db";
import { type Same, z, zDateNul, zObject, zStr, zStrNul } from "../utils";
import { vendorP, vendorZ } from "./vendor";

export const userFullS = {
  id: true,
  name: true,
  email: true,
  phone: true,
  isAdmin: true,
  staffRole: true,
  expiredAt: true,
  lockUntil: true,
  vendor: vendorP,
} satisfies Prisma.UserSelect;

export const userFullZ = zObject("UserFullT", {
  id: zStr("The user's ID"),
  name: zStr("The user's name"),
  email: zStr("The user's email address"),
  phone: zStrNul("The user's phone number"),
  isAdmin: z.boolean().describe("Is this user an admin?"),
  expiredAt: zDateNul("The time that the account expired, or null"),
  lockUntil: zDateNul(""),
  staffRole: z
    .enum(StaffRole)
    .nullable()
    .describe("The user's role, if they are MTN staff"),
  vendor: vendorZ
    .nullable()
    .describe("The vendor to which the user belongs, if any"),
} satisfies Record<keyof typeof userFullS, object>);

export const userFullP = { select: userFullS };

type UserFullP = Prisma.UserGetPayload<typeof userFullP>;
type UserFullZ = z.infer<typeof userFullZ>;

export type UserFullT = Same<UserFullP, UserFullZ>;
