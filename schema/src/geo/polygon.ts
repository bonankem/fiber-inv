import z from "zod";
import { coordsZ, fromLonLat, latZ, lonZ } from "./coords";

export const linearRingZ = z.array(coordsZ);

export const polygonZ = z.array(linearRingZ);

export const multiPolygonZ = z.array(polygonZ).meta({ id: "MultiPolygonT" });

export const boundingBoxZ = z.object({
  north: latZ,
  south: latZ,
  east: lonZ,
  west: lonZ,
});

export type LinearRingT = z.infer<typeof linearRingZ>;

export type PolygonT = z.infer<typeof polygonZ>;

export type MultiPolygonT = z.infer<typeof multiPolygonZ>;

export type BoundingBoxT = z.infer<typeof boundingBoxZ>;

declare global {
  namespace PrismaJson {
    type MultiPolygonJson = MultiPolygonT;
  }
}

type TuplePoint = number[];
type TupleRing = TuplePoint[];
type TuplePoly = TupleRing[];
type TupleMPol = TuplePoly[];

type TupleGeom = TupleRing | TuplePoly | TupleMPol;

function isTuplePoint(p: unknown): p is TuplePoint {
  return Array.isArray(p) && typeof p[0] === "number";
}

function isTupleRing(p: unknown[]): p is TupleRing {
  return isTuplePoint(p[0]);
}

function isTuplePoly(p: unknown[][]): p is TuplePoly {
  return isTupleRing(p[0]);
}

export function multiPolygonFromGeoJson(g: TupleGeom): MultiPolygonT {
  if (isTupleRing(g)) return [[g.map(fromLonLat)]];
  if (isTuplePoly(g)) return [g.map((l) => l.map(fromLonLat))];
  return g.map((p) => p.map((l) => l.map(fromLonLat)));
}
