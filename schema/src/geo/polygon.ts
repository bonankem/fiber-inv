import z from "zod";
import { coordsZ } from "./coords";

export const linearRingZ = z.array(coordsZ);

export const polygonZ = z.array(linearRingZ);

export const multiPolygonZ = z.array(polygonZ).meta({ id: "MultiPolygonT" });

export type LinearRingT = z.infer<typeof linearRingZ>;

export type PolygonT = z.infer<typeof polygonZ>;

export type MultiPolygonT = z.infer<typeof multiPolygonZ>;
