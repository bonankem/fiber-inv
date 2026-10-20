import type { Prisma } from "../db";
import { coordsP, coordsZ } from "../geo";
import { type Same, type z, zObject, zStr, zStrNul } from "../utils";

export const fatS = {
  id: true,
  name: true,
  coords: coordsP,
  oltId: true,
} satisfies Prisma.FatSelect;

export const fatZ = zObject("FatT", {
  id: zStr(""),
  name: zStr(""),
  coords: coordsZ.nullable(),
  oltId: zStrNul(""),
} satisfies Record<keyof typeof fatS, object>);

export const fatP = { select: fatS };

export const fatListP = {
  select: fatS,
  orderBy: { name: "asc" },
} satisfies Prisma.FatFindManyArgs;

type FatP = Prisma.FatGetPayload<typeof fatP>;
type FatZ = z.infer<typeof fatZ>;

export type FatT = Same<FatP, FatZ>;
