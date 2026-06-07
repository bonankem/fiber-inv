import { idKeyNameP, idKeyNameZ } from "#/common";
import { coordsP, coordsZ } from "#/geo";
import type { Prisma } from "../prisma";
import { type Same, type z, zObject, zStr } from "../utils";

export const ftthBoxS = {
  id: true,
  name: true,
  oltId: true,
  oem: idKeyNameP,
  coords: coordsP,
} satisfies Prisma.FtthBoxSelect;

export const ftthBoxZ = zObject("FtthBoxT", {
  id: zStr("The box ID"),
  name: zStr("The box name"),
  oltId: zStr("The OLT ID for this box"),
  oem: idKeyNameZ.describe("The box OEM"),
  coords: coordsZ.nullable().describe("The box's location"),
} satisfies Record<keyof typeof ftthBoxS, object>);

export const ftthBoxP = { select: ftthBoxS };

export const ftthBoxListP = {
  select: ftthBoxS,
  orderBy: [{ name: "asc" }],
} satisfies Prisma.FtthBoxFindManyArgs;

type FtthBoxP = Prisma.FtthBoxGetPayload<typeof ftthBoxP>;
type FtthBoxZ = z.infer<typeof ftthBoxZ>;

export type FtthBoxT = Same<FtthBoxP, FtthBoxZ>;
