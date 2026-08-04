import type { Prisma } from "../db";
import { type Same, z, zObject, zStr, zStrOpt } from "../utils";
import { fhcCostConditionP, fhcCostConditionZ } from "./fhc-cost-condition";

export const fhcCostLineS = {
  id: true,
  ref: true,
  nameEn: true,
  nameFr: true,
  condition: fhcCostConditionP,
} satisfies Prisma.FhcCostLineSelect;

export const fhcCostLineZ = zObject("FhcCostLineT", {
  id: zStr(""),
  ref: zStr(""),
  nameEn: zStr(""),
  nameFr: zStr(""),
  condition: fhcCostConditionZ.nullable(),
} satisfies Record<keyof typeof fhcCostLineS, object>);

export const fhcCostLineP = { select: fhcCostLineS };

export const fhcCostLineListP = {
  select: fhcCostLineS,
} satisfies Prisma.FhcCostLineFindManyArgs;

export type FhcCostLineT = Same<
  Prisma.FhcCostLineGetPayload<typeof fhcCostLineP>,
  z.infer<typeof fhcCostLineZ>
>;

export const fhcAddCostLineZ = zObject("FhcAddCostLineT", {
  ref: zStr(""),
  nameEn: zStrOpt(""),
  nameFr: zStrOpt(""),
  conditionId: z.string().nullable().optional(),
});

export const fhcAddCostLinesZ = zObject("FhcAddCostLinesT", {
  items: fhcAddCostLineZ.array(),
});

export type FhcAddCostLineT = z.infer<typeof fhcAddCostLineZ>;

export type FhcAddCostLinesT = z.infer<typeof fhcAddCostLinesZ>;
