import type { Prisma } from "../db";
import { type Same, z, zObject, zStr } from "../utils";

export const fhsQuantityS = {
  id: true,
  xBoxes: true,
  hubBoxes: true,
  fats: true,
  closures: true,
  manholes: true,
  metalPoles: true,
  concretePoles: true,
  transportLength: true,
  distLength: true,
} satisfies Prisma.FhsQuantitySelect;

export const fhsQuantityZ = zObject("FhsQuantityT", {
  id: zStr("The report ID"),
  xBoxes: z.int(),
  hubBoxes: z.int(),
  fats: z.int(),
  closures: z.int(),
  manholes: z.int(),
  metalPoles: z.int(),
  concretePoles: z.int(),
  transportLength: z.int(),
  distLength: z.int(),
} satisfies Record<keyof typeof fhsQuantityS, object>);

export const fhsQuantityP = { select: fhsQuantityS };

type FhsQuantityP = Prisma.FhsQuantityGetPayload<typeof fhsQuantityP>;
type FhsQuantityZ = z.infer<typeof fhsQuantityZ>;

export type FhsQuantityT = Same<FhsQuantityP, FhsQuantityZ>;
