import { OnConflict } from "../common";
import type { Prisma } from "../db";
import { type Same, z, zObject, zStr } from "../utils";

export const fhcPbItemS = {
  id: true,
  ref: true,
  nameEn: true,
  nameFr: true,
} satisfies Prisma.FhcPbItemSelect;

export const fhcPbItemZ = zObject("FhcPbItemT", {
  id: zStr("The ID of this item"),
  ref: zStr("The MTN ref number for this item"),
  nameEn: zStr("The name of this item in English"),
  nameFr: zStr("Le nom de cet item en français"),
} satisfies Record<keyof typeof fhcPbItemS, object>);

export const fhcPbItemP = { select: fhcPbItemS };

export const fhcPbItemListP = {
  select: fhcPbItemS,
  orderBy: { ref: "asc" },
} satisfies Prisma.FhcPbItemFindManyArgs;

type FhcPbItemP = Prisma.FhcPbItemGetPayload<typeof fhcPbItemP>;
type FhcPbItemZ = z.infer<typeof fhcPbItemZ>;

export type FhcPbItemT = Same<FhcPbItemP, FhcPbItemZ>;

export const fhcPbUpdateItemZ = zObject("FhcPbUpdateItemT", {
  ref: z.string(),
  nameEn: z.string().optional(),
  nameFr: z.string().optional(),
});

export const fhcPbUpdateZ = zObject("FhcPbUpdateT", {
  items: fhcPbUpdateItemZ.array(),
  onConflict: z.enum(OnConflict).default(OnConflict.SKIP),
});

export type FhcPbUpdateItemT = z.infer<typeof fhcPbUpdateItemZ>;

export type FhcPbUpdateT = z.infer<typeof fhcPbUpdateZ>;
