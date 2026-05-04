import { type Prisma, type Same, z, zObject } from "../common";

export const coordsS = {
  lat: true,
  lng: true,
} satisfies Prisma.CoordsSelect;

export const coordsZ = zObject("CoordsT", {
  lat: z.number().describe("Latitude"),
  lng: z.number().describe("Longitude"),
} satisfies Record<keyof typeof coordsS, object>);

export const coordsP = { select: coordsS };

type CoordsP = Prisma.CoordsGetPayload<typeof coordsP>;
type CoordsZ = z.infer<typeof coordsZ>;

export type CoordsT = Same<CoordsP, CoordsZ>;
