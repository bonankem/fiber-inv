import { coordsP, coordsZ } from "#/geo";
import { BoxType, type Prisma } from "../db";
import { type Same, z, zObject, zStr, zStrNul } from "../utils";

export const boxS = {
  id: true,
  name: true,
  type: true,
  coords: coordsP,
  oemId: true,
  oltId: true,
} satisfies Prisma.FtthBoxSelect;

export const boxZ = zObject("BoxT", {
  id: zStr(""),
  name: zStr(""),
  type: z.enum(BoxType),
  coords: coordsZ.nullable(),
  oemId: zStrNul(""),
  oltId: zStrNul(""),
} satisfies Record<keyof typeof boxS, object>);

export const boxP = { select: boxS };

export const boxListP = {
  select: boxS,
  orderBy: { name: "asc" },
} satisfies Prisma.FtthBoxFindManyArgs;

type BoxP = Prisma.FtthBoxGetPayload<typeof boxP>;
type BoxZ = z.infer<typeof boxZ>;

export type BoxT = Same<BoxP, BoxZ>;
