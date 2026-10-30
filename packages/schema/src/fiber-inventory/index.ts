import type { infer as ZodInfer } from "zod";
import { lineStringZ } from "../geo";
import { z, zArray, zObject, zStr } from "../utils";

export const fiberSiteZ = zObject("FiberSiteT", {
  code: zStr("Site code"),
  siteName: zStr("Site name"),
  locality: zStr("Locality"),
  lat: z.number(),
  lng: z.number(),
  matchedFeature: z.string().nullable(),
  matchedKind: z.enum(["polygon", "line", "point"]).nullable(),
  /** Metres from the site to the matched feature (0 = inside a polygon) */
  matchedDistance: z.number().nullable(),
});

export const fiberSiteSourceZ = zObject("FiberSiteSourceT", {
  code: zStr("Site code"),
  siteName: zStr("Site name"),
  locality: zStr("Locality"),
  lat: z.number(),
  lng: z.number(),
});

export const fiberKmzFeatureZ = zObject("FiberKmzFeatureT", {
  name: zStr("KMZ feature name"),
  geom: lineStringZ,
  kind: z.enum(["polygon", "line", "point"]),
});

export const fiberInventoryItemZ = zObject("FiberInventoryItemT", {
  name: zStr("KMZ feature name"),
  geom: lineStringZ,
  kind: z.enum(["polygon", "line", "point"]),
  sites: zArray(fiberSiteZ),
});

export const fiberInventoryZ = zObject("FiberInventoryT", {
  uploads: zArray(
    zObject("FiberInventoryUploadT", {
      id: zStr("Uploaded source ID"),
      name: zStr("Uploaded source filename"),
      kind: z.enum(["kmz", "spreadsheet"]),
    }),
  ),
  items: zArray(fiberInventoryItemZ),
  sites: zArray(fiberSiteZ),
});

export type FiberInventoryT = ZodInfer<typeof fiberInventoryZ>;
export type FiberInventoryItemT = ZodInfer<typeof fiberInventoryItemZ>;
export type FiberSiteT = ZodInfer<typeof fiberSiteZ>;

export * from "./matching";
export * from "./sites";
