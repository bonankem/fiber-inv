import type z from "zod";
import { lineStringZ } from "#/geo";
import { zObject, zStr } from "#/utils";

export const kmlItemZ = zObject("KmlItemT", {
  name: zStr("The placemark name"),
  geom: lineStringZ.describe(
    "An array of points. " +
      "If the array has a single value, then this is a point. " +
      "Otherwise, it is either a line string or linear ring.",
  ),
});

export type KmlItemT = z.infer<typeof kmlItemZ>;
