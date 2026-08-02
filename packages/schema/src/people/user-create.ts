import { StaffRole } from "#/db";
import { z, zObject } from "../utils";

export const userCreateZ = zObject("UserCreateT", {
  name: z.string(),
  email: z.string(),
  isAdmin: z.boolean().optional(),
  vendorId: z.string().optional(),
  staffRole: z.enum(StaffRole).optional(),
});

export type UserCreateT = z.infer<typeof userCreateZ>;
