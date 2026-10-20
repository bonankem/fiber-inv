import z from "zod";
import { WorkDocType } from "../../db";
import { boundingBoxZ, coordsZ, linearRingZ } from "../../geo";
import { zObject } from "../../utils";

export const upAreaKmzZ = zObject("UpAreaKmzT", {
  type: z.literal(WorkDocType.FHS_AREA_KMZ),
  localityId: z.uuid().optional(),
  name: z.string().optional(),
  coords: coordsZ,
  boundary: linearRingZ,
  bbox: boundingBoxZ,
});

export type UpPlaqueKmzT = z.infer<typeof upAreaKmzZ>;
