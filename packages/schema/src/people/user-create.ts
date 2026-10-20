import { StaffRole } from "../db";
import { z, zObject } from "../utils";

export const userCreateZ = zObject("UserCreateT", {
  name: z.string(),
  email: z.string(),
  isAdmin: z.boolean().optional(),
  vendorId: z.string().optional(),
  staffRole: z.enum(StaffRole).optional(),
});

export type UserCreateT = z.infer<typeof userCreateZ>;

export const vendorBulkItemZ = zObject("VendorBulkItemT", {
  name: z.string(),
  email: z.string(),
  vendor: z.string(),
});

export const vendorBulkZ = zObject("VendorBulkT", {
  commit: z.boolean().optional(),
  items: vendorBulkItemZ.array(),
});

export type VendorBulkT = z.infer<typeof vendorBulkZ>;
