import type { Prisma } from "../db";
import { z } from "../utils";

export const equipmentS = {
  id: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  description: true,
  mtnCode: true,
  ifsCode: true,
  partNumber: true,
  manufacturer: true,
  tag: true,
  available: true,
  dateSynced: true,
} satisfies Prisma.EquipmentSelect;

export const equipmentP = { select: equipmentS };

export const equipmentZ = z.object({
  id: z.uuid(),
  mtnCode: z.string(),
  ifsCode: z.string().nullish(),
  partNumber: z.string().nullish(),
  name: z.string(),
  description: z.string().nullish(),
  manufacturer: z.string().nullish(),
  tag: z.string().nullish(),
  available: z.int(),
  dateSynced: z.string().nullish(),
});

export type EquipmentT = z.infer<typeof equipmentZ>;
export type EquipmentS = EquipmentT;
