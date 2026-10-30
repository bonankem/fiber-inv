import { z } from "../utils";

export const equipmentCreateZ = z.object({
  mtnCode: z.string().trim().min(1, "Item Code is required"),
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().nullish(),
  ifsCode: z.string().trim().nullish(),
  partNumber: z.string().trim().nullish(),
  manufacturer: z.string().trim().nullish(),
  tag: z.string().trim().nullish(),
  available: z.int().min(0).default(0),
  dateSynced: z.string().trim().nullish(),
});

export type EquipmentCreateT = z.infer<typeof equipmentCreateZ>;

/** Bulk-create used by the import modal. */
export const equipmentBulkCreateZ = z.object({
  items: z.array(equipmentCreateZ),
});

export type EquipmentBulkCreateT = z.infer<typeof equipmentBulkCreateZ>;
