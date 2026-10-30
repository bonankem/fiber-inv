import { z } from "../utils";

export const equipmentListZ = z.object({
  search: z.string().optional(),
  // comma-separated MTN or IFS codes, matched exactly
  codes: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});

export type EquipmentListT = z.infer<typeof equipmentListZ>;

/** The fields an inventory picker needs from each list item. */
export const equipmentItemZ = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  mtnCode: z.string(),
  ifsCode: z.string().nullable(),
  partNumber: z.string().nullable(),
  available: z.int(),
});

export const equipmentPageZ = z.object({
  items: z.array(equipmentItemZ),
  pagination: z.object({
    page: z.int(),
    pageSize: z.int(),
    total: z.int(),
    totalPages: z.int(),
  }),
});

export type EquipmentItemT = z.infer<typeof equipmentItemZ>;
export type EquipmentPageT = z.infer<typeof equipmentPageZ>;
