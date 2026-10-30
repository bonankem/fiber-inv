import type { Prisma } from "../db";
import { type Same, z, zObject, zStr } from "../utils";

export const equipmentS = {
  id: true,
  mtnCode: true,
  ifsCode: true,
  available: true,
  name: true,
  description: true,
  partNumber: true,
  dateSynced: true,
} satisfies Prisma.EquipmentSelect;

export const equipmentZ = zObject("EquipmentT", {
  id: zStr(""),
  name: zStr(""),
  description: zStr("").nullable(),
  mtnCode: zStr(""),
  ifsCode: zStr("").nullable(),
  partNumber: zStr("").nullable(),
  available: z.int(),
  dateSynced: zStr("").nullable(),
} satisfies Record<keyof typeof equipmentS, object>);

export const equipmentP = { select: equipmentS };

export const equipmentListP = {
  select: equipmentS,
  orderBy: { ifsCode: "asc" },
} satisfies Prisma.EquipmentFindManyArgs;

type EquipmentP = Prisma.EquipmentGetPayload<typeof equipmentP>;
type EquipmentZ = z.infer<typeof equipmentZ>;

export type EquipmentT = Same<EquipmentP, EquipmentZ>;
