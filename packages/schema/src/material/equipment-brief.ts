import type { Prisma } from "../db";
import { type Same, z, zObject, zStr } from "../utils";


export const equipmentBriefS = {
  id: true,
  name: true,
  mtnCode: true,
  ifsCode: true,
  description: true,
  available: true,
} satisfies Prisma.EquipmentSelect;

export const equipmentBriefZ = zObject("EquipmentBriefT", {
  id: zStr(""),
  name: zStr(""),
  mtnCode: zStr(""),
  ifsCode: zStr("").nullable(),
  description: zStr("").nullable(),
  available: z.int().describe("Available stock"),
} satisfies Record<keyof typeof equipmentBriefS, object>);


export const equipmentBriefP = { select: equipmentBriefS };

type EquipmentBriefP = Prisma.EquipmentGetPayload<typeof equipmentBriefP>;
type EquipmentBriefZ = z.infer<typeof equipmentBriefZ>;

export type EquipmentBriefT = Same<EquipmentBriefP, EquipmentBriefZ>;
