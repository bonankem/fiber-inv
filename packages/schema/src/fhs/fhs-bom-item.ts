import type { Prisma } from "../db";
import { type Same, z, zObject, zStr } from "../utils";

export const fhsBomEquipmentS = {
  id: true,
  name: true,
  description: true,
  mtnCode: true,
  ifsCode: true,
  partNumber: true,
  available: true,
} satisfies Prisma.EquipmentSelect;

export const fhsBomEquipmentZ = zObject("FhsBomEquipmentT", {
  id: zStr("The equipment ID"),
  name: zStr("The equipment name"),
  description: zStr("The equipment description").nullable(),
  mtnCode: zStr("The MTN item code"),
  ifsCode: zStr("The IFS item code").nullable(),
  partNumber: zStr("The manufacturer part number").nullable(),
  available: z.int().describe("The quantity currently in stock"),
} satisfies Record<keyof typeof fhsBomEquipmentS, object>);

export const fhsBomItemS = {
  id: true,
  equipment: { select: fhsBomEquipmentS },
  quantity: true,
} satisfies Prisma.FhsBomItemSelect;

export const fhsBomItemZ = zObject("FhsBomItemT", {
  id: zStr("The BOM line ID"),
  equipment: fhsBomEquipmentZ,
  quantity: z.int().describe("The quantity required"),
} satisfies Record<keyof typeof fhsBomItemS, object>);

export const fhsBomItemListP = {
  select: fhsBomItemS,
  orderBy: { position: "asc" },
} satisfies Prisma.FhsBomItemFindManyArgs;

type FhsBomItemP = Prisma.FhsBomItemGetPayload<{ select: typeof fhsBomItemS }>;
type FhsBomItemZ = z.infer<typeof fhsBomItemZ>;

export type FhsBomItemT = Same<FhsBomItemP, FhsBomItemZ>;
export type FhsBomEquipmentT = z.infer<typeof fhsBomEquipmentZ>;
