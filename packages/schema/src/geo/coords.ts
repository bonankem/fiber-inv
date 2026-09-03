import type { Prisma } from "../db";
import { type Maybe, type Same, z, zObject } from "../utils";

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

export function coordsToStr(c: Maybe<CoordsT>) {
  if (!c) return null;
  const ns = c.lat >= 0 ? "N" : "S";
  const ew = c.lng >= 0 ? "E" : "W";
  const lat = Math.abs(c.lat).toFixed(5);
  const lng = Math.abs(c.lng).toFixed(5);
  return `${lat}°${ns}, ${lng}°${ew}`;
}
