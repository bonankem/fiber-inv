import { coordsZ } from "../geo";
import { linearRingZ } from "../geo/polygon";
import { WorkDocType } from "../prisma";
import { z, zObject, zStr } from "../utils";

export const upPlaqueKmzZ = zObject("UpPlaqueKmzT", {
  type: z.literal(WorkDocType.PLAQUE_KMZ),
  localityId: z.uuid().optional(),
  coords: coordsZ,
  boundary: linearRingZ,
});

export type UpPlaqueKmzT = z.infer<typeof upPlaqueKmzZ>;

////

const upCoordsItemZ = z.object({
  name: zStr("The name of this element"),
  coords: coordsZ.nullable().describe("The coordinates of this element"),
});

export const upCoordinatesZ = zObject("UpCoordinatesT", {
  type: z.literal(WorkDocType.COORDINATES),
  items: z.array(upCoordsItemZ),
  madeAt: z.date().nullable(),
});

export type UpCoordinatesT = z.infer<typeof upCoordinatesZ>;

////

export const uploadParsedZ = z.discriminatedUnion("type", [
  upPlaqueKmzZ,
  upCoordinatesZ,
]);

export type UploadParsedT = z.infer<typeof uploadParsedZ>;
