import { OnConflict } from "#/common";
import type { Prisma } from "../db";
import { type Same, z, zObject, zStr } from "../utils";

export const fhcPbLineS = {
  id: true,
  ref: true,
  nameEn: true,
  nameFr: true,
} satisfies Prisma.FhcPbLineSelect;

export const fhcPbLineZ = zObject("FhcPbLineT", {
  id: zStr("The ID of this line"),
  ref: zStr("The MTN ref number for this line"),
  nameEn: zStr("The name of this line in English"),
  nameFr: zStr("Le nom de cette ligne en français"),
} satisfies Record<keyof typeof fhcPbLineS, object>);

export const fhcPbLineP = { select: fhcPbLineS };

export const fhcPbLineListP = {
  select: fhcPbLineS,
  orderBy: { ref: "asc" },
} satisfies Prisma.FhcPbLineFindManyArgs;

type FhcPbLineP = Prisma.FhcPbLineGetPayload<typeof fhcPbLineP>;
type FhcPbLineZ = z.infer<typeof fhcPbLineZ>;

export type FhcPbLineT = Same<FhcPbLineP, FhcPbLineZ>;

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
