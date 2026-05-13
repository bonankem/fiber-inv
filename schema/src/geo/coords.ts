import { type Prisma, type Same, z, zObject } from "../base";

export const latZ = z.number().min(-90).max(90).describe("Latitude");
export const lngZ = z.number().min(-180).max(180).describe("Latitude");

export const coordsS = {
  lat: true,
  lng: true,
} satisfies Prisma.CoordsSelect;

export const coordsZ = zObject("CoordsT", {
  lat: latZ,
  lng: lngZ,
} satisfies Record<keyof typeof coordsS, object>);

export const coordsP = { select: coordsS };

type CoordsP = Prisma.CoordsGetPayload<typeof coordsP>;
type CoordsZ = z.infer<typeof coordsZ>;

export type CoordsT = Same<CoordsP, CoordsZ>;
