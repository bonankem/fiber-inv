import { idNameP, idNameZ } from "#/common";
import { coordsP, coordsZ } from "#/geo";
import { BoxType, type Prisma } from "../prisma";
import { type Same, z, zObject, zStr } from "../utils";

export const boxS = {
  id: true,
  name: true,
  type: true,
  coords: coordsP,
  oem: idNameP,
  olt: idNameP,
} satisfies Prisma.FtthBoxSelect;

export const boxZ = zObject("BoxT", {
  id: zStr(""),
  name: zStr(""),
  type: z.enum(BoxType),
  coords: coordsZ.nullable(),
  oem: idNameZ,
  olt: idNameZ,
} satisfies Record<keyof typeof boxS, object>);

export const boxP = { select: boxS };

export const boxListP = {
  select: boxS,
  orderBy: { name: "asc" },
} satisfies Prisma.FtthBoxFindManyArgs;

type BoxP = Prisma.FtthBoxGetPayload<typeof boxP>;
type BoxZ = z.infer<typeof boxZ>;

export type BoxT = Same<BoxP, BoxZ>;
