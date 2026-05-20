import type { Prisma } from "../prisma";
import { type Same, z, zObject } from "../utils";

export const latZ = z.number().min(-90).max(90).describe("Latitude");
export const lonZ = z.number().min(-180).max(180).describe("Latitude");

export const coordsS = {
  lat: true,
  lon: true,
} satisfies Prisma.CoordsSelect;

export const coordsZ = zObject("CoordsT", {
  lat: latZ,
  lon: lonZ,
} satisfies Record<keyof typeof coordsS, object>);

export const coordsP = { select: coordsS };

type CoordsP = Prisma.CoordsGetPayload<typeof coordsP>;
type CoordsZ = z.infer<typeof coordsZ>;

export type CoordsT = Same<CoordsP, CoordsZ>;

export function fromLonLat(p: number[]) {
  return { lon: p[0], lat: p[1] };
}
