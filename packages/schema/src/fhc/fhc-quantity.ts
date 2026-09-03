import type { Prisma } from "#/db";
import { type Same, z, zObject, zStr } from "#/utils";
import { fhcPbItemP, fhcPbItemZ } from "./fhc-pricebook";

export const fhcQuantityS = {
  id: true,
  item: fhcPbItemP,
  cost: true,
  quantity: true,
} satisfies Prisma.FhcQuantitySelect;

export const fhcQuantityZ = zObject("FhcQuantityT", {
  id: zStr(""),
  item: fhcPbItemZ,
  cost: z.number().nullable(),
  quantity: z.number(),
} satisfies Record<keyof typeof fhcQuantityS, object>);

export const fhcQuantityP = { select: fhcQuantityS };

export const fhcQuantityListP = {
  select: fhcQuantityS,
  orderBy: { item: { ref: "asc" } },
} satisfies Prisma.FhcQuantityFindManyArgs;

type FhcQuantityP = Prisma.FhcQuantityGetPayload<typeof fhcQuantityP>;
type FhcQuantityZ = z.infer<typeof fhcQuantityZ>;

export type FhcQuantityT = Same<FhcQuantityP, FhcQuantityZ>;
