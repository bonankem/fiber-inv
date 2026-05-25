import z from "zod";
import { coordsZ, linearRingZ } from "#/geo";
import { WorkDocType } from "#/prisma";
import { zObject } from "#/utils";

export const upPlaqueKmzZ = zObject("UpPlaqueKmzT", {
  type: z.literal(WorkDocType.PLAQUE_KMZ),
  localityId: z.uuid().optional(),
  name: z.string().optional(),
  coords: coordsZ,
  boundary: linearRingZ,
});

export type UpPlaqueKmzT = z.infer<typeof upPlaqueKmzZ>;
