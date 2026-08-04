import type { Prisma } from "../db";
import { type Same, z, zObject, zStr } from "../utils";

export const fhcCostConditionS = {
  id: true,
  name: true,
  minDistance: true,
  maxDistance: true,
  usesPole: true,
} satisfies Prisma.FhcCostConditionSelect;

export const fhcCostConditionZ = zObject("FhcCostConditionT", {
  id: zStr(""),
  name: zStr(""),
  minDistance: z.int(),
  maxDistance: z.int(),
  usesPole: z.int(),
} satisfies Record<keyof typeof fhcCostConditionS, object>);

export const fhcCostConditionP = { select: fhcCostConditionS };

export const fhcCostConditionListP = {
  select: fhcCostConditionS,
} satisfies Prisma.FhcCostConditionFindManyArgs;

export type FhcCostConditionT = Same<
  Prisma.FhcCostConditionGetPayload<typeof fhcCostConditionP>,
  z.infer<typeof fhcCostConditionZ>
>;

export const fhcAddCostConditionZ = zObject("FhcAddCostConditionT", {
  name: z.string(),
  minDistance: z.int(),
  maxDistance: z.int(),
  usesPole: z.int(),
});

export const fhcAddCostConditionsZ = zObject("FhcAddCostConditionsT", {
  items: fhcAddCostConditionZ.array(),
});

export type FhcAddCostConditionT = z.infer<typeof fhcAddCostConditionZ>;
export type FhcAddCostConditionsT = z.infer<typeof fhcAddCostConditionsZ>;
