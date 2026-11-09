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
  /** Closest network feature at any distance (set for unmatched sites too) */
  nearestFeature: z.string().nullable().optional(),
  nearestDistance: z.number().nullable().optional(),
  /** The spreadsheet source this site came from */
  sourceId: z.string().optional(),
});

export const fiberSiteSourceZ = zObject("FiberSiteSourceT", {
  code: zStr("Site code"),
  siteName: zStr("Site name"),
  locality: zStr("Locality"),
  lat: z.number(),
  lng: z.number(),
});

const featureCategoryZ = z
  .enum(["manhole", "other"])
  .optional()
  .describe("What the feature is, e.g. a manhole (chambre)");
const manholeStatusZ = z
  .enum(["existing", "new"])
  .nullable()
  .optional()
  .describe("Manhole status, from its KMZ folder");

const layerZ = z
  .string()
  .optional()
  .describe("KMZ folder path / CAD layer the feature came from");
const propsZ = z
  .record(z.string(), z.string())
  .optional()
  .describe("Attributes from the KMZ (ExtendedData or description)");

export const fiberKmzFeatureZ = zObject("FiberKmzFeatureT", {
  name: zStr("KMZ feature name"),
  geom: lineStringZ,
  kind: z.enum(["polygon", "line", "point"]),
  category: featureCategoryZ,
  status: manholeStatusZ,
  layer: layerZ,
  props: propsZ,
});

export const fiberInventoryItemZ = zObject("FiberInventoryItemT", {
  name: zStr("KMZ feature name"),
  geom: lineStringZ,
  kind: z.enum(["polygon", "line", "point"]),
  category: featureCategoryZ,
  status: manholeStatusZ,
  layer: layerZ,
  props: propsZ,
  /** The KMZ source this feature came from */
  sourceId: z.string().optional(),
  sites: zArray(fiberSiteZ),
});

export const fiberLayerZ = zObject("FiberLayerT", {
  name: zStr("Layer name"),
  count: z.int(),
});

export const fiberSourceZ = zObject("FiberSourceT", {
  id: zStr("Source ID"),
  name: zStr("Uploaded filename"),
  kind: z.enum(["kmz", "spreadsheet"]),
  visible: z.boolean(),
  /** Features (kmz) or sites (spreadsheet) on the map from this source */
  count: z.int(),
  createdAt: z.string(),
  layers: zArray(fiberLayerZ),
  excludedLayers: zArray(z.string()),
});

export const fiberInventoryZ = zObject("FiberInventoryT", {
  uploads: zArray(fiberSourceZ),
  items: zArray(fiberInventoryItemZ),
  sites: zArray(fiberSiteZ),
});

export type FiberInventoryT = ZodInfer<typeof fiberInventoryZ>;
export type FiberInventoryItemT = ZodInfer<typeof fiberInventoryItemZ>;
export type FiberSiteT = ZodInfer<typeof fiberSiteZ>;
export type FiberSourceT = ZodInfer<typeof fiberSourceZ>;
export type FiberLayerT = ZodInfer<typeof fiberLayerZ>;

/** Upload options sent with the file */
export const fiberUploadOptionsZ = z.object({
  excludedLayers: z.array(z.string()).max(500).default([]),
});
export type FiberUploadOptionsT = z.input<typeof fiberUploadOptionsZ>;

export const fiberSourceIdZ = z.object({ id: z.uuid() });
export const fiberSourceVisibleZ = z.object({
  id: z.uuid(),
  visible: z.boolean(),
});
export const fiberSourceLayersZ = z.object({
  id: z.uuid(),
  excludedLayers: z.array(z.string()).max(500),
});

export * from "./classify";
export * from "./geometry";
export * from "./layers";
export * from "./matching";
export * from "./sites";
