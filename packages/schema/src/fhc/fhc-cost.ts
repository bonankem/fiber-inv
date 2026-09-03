import { FhcCostCategory, type Prisma } from "../db";
import { type Same, z, zObject, zStr } from "../utils";
import { fhcQuantityListP, fhcQuantityZ } from "./fhc-quantity";

export const fhcCostS = {
  id: true,
  costCategory: true,
  totalCost: true,
  quantities: fhcQuantityListP,
} satisfies Prisma.FtthConnectionSelect;

export const fhcCostZ = zObject("FhcCostT", {
  id: zStr(""),
  costCategory: z.enum(FhcCostCategory).nullable(),
  totalCost: z.number().nullable(),
  quantities: fhcQuantityZ.array(),
} satisfies Record<keyof typeof fhcCostS, object>);

export const fhcCostP = { select: fhcCostS };

type FhcCostP = Prisma.FtthConnectionGetPayload<typeof fhcCostP>;
type FhcCostZ = z.infer<typeof fhcCostZ>;

export type FhcCostT = Same<FhcCostP, FhcCostZ>;
