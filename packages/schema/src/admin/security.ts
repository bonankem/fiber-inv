import type { Prisma } from "../db";
import { type Same, z, zObject } from "../utils";

export const securityS = {
  adminInactiveDays: true,
  inactiveLockDays: true,
  lockoutAttempts: true,
  lockoutMinutes: true,
  newInactiveDays: true,
  userInactiveDays: true,
} satisfies Prisma.SecuritySelect;

export const securityZ = zObject("SecurityT", {
  adminInactiveDays: z.int(),
  userInactiveDays: z.int(),
  newInactiveDays: z.int(),
  inactiveLockDays: z.int(),
  lockoutAttempts: z.int(),
  lockoutMinutes: z.int(),
} satisfies Record<keyof typeof securityS, object>);

type SecurityP = Prisma.SecurityGetPayload<{ select: typeof securityS }>;
type SecurityZ = z.infer<typeof securityZ>;

export type SecurityT = Same<SecurityP, SecurityZ>;
