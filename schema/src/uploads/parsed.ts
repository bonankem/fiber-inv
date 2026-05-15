import { coordsZ } from "../geo";
import { linearRingZ } from "../geo/polygon";
import { WorkDocType } from "../prisma";
import { z, zObject } from "../utils";

export const upPlaqueKmzZ = zObject("UpPlaqueKmzT", {
  type: z.literal(WorkDocType.PLAQUE_KMZ),
  localityId: z.uuid().optional(),
  coords: coordsZ,
  boundary: linearRingZ,
});

export type UpPlaqueKmzT = z.infer<typeof upPlaqueKmzZ>;

export const uploadParsedZ = z.discriminatedUnion("type", [upPlaqueKmzZ]);

export type UploadParsedT = z.infer<typeof uploadParsedZ>;
