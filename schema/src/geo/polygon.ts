import z from "zod";
import { coordsZ, latZ, lonZ } from "./coords";

export const linearRingZ = z.array(coordsZ);

export const lineStringZ = z.array(coordsZ);

export const polygonZ = z.array(linearRingZ).meta({ id: "PolygonT" });

export const boundingBoxZ = z.object({
  north: latZ,
  south: latZ,
  east: lonZ,
  west: lonZ,
});

export type LinearRingT = z.infer<typeof linearRingZ>;

export type LineStringT = z.infer<typeof linearRingZ>;

export type PolygonT = z.infer<typeof polygonZ>;

export type BoundingBoxT = z.infer<typeof boundingBoxZ>;

declare global {
  namespace PrismaJson {
    type PolygonJson = PolygonT;
    type LinearRingJson = LinearRingT;
    type LineStringJson = LineStringT;
  }
}
