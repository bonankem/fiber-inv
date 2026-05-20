import z from "zod";
import { coordsZ, fromLonLat } from "./coords";

export const linearRingZ = z.array(coordsZ);

export const polygonZ = z.array(linearRingZ);

export const multiPolygonZ = z.array(polygonZ).meta({ id: "MultiPolygonT" });

export type LinearRingT = z.infer<typeof linearRingZ>;

export type PolygonT = z.infer<typeof polygonZ>;

export type MultiPolygonT = z.infer<typeof multiPolygonZ>;

declare global {
  namespace PrismaJson {
    type MultiPolygonJson = MultiPolygonT;
  }
}

export function multiPolygonFromGeoJson(poly: number[][][]): MultiPolygonT {
  // turn polygons to multipolygons by wrapping them in another array
  return [poly.map((l) => l.map(fromLonLat))];
}
