import { coordsZ } from "../geo";
import { linearRingZ } from "../geo/polygon";
import { WorkDocType } from "../prisma";
import { z, zObject, zStr } from "../utils";

export const upPlaqueKmzZ = zObject("UpPlaqueKmzT", {
  type: z.literal(WorkDocType.PLAQUE_KMZ),
  localityId: z.uuid().optional(),
  name: z.string().optional(),
  coords: coordsZ,
  boundary: linearRingZ,
});

export type UpPlaqueKmzT = z.infer<typeof upPlaqueKmzZ>;

////

const upFhsCoordsItemZ = z.object({
  name: zStr("The name of this element"),
  coords: coordsZ.nullable().describe("The coordinates of this element"),
});

export const upFhsCoordsZ = zObject("UpFhsCoordsT", {
  type: z.literal(WorkDocType.COORDINATES),
  items: z.array(upFhsCoordsItemZ),
  madeAt: z.date().nullable(),
});

export type UpFhsCoordsT = z.infer<typeof upFhsCoordsZ>;

////

export const uploadParsedZ = z.discriminatedUnion("type", [
  upPlaqueKmzZ,
  upFhsCoordsZ,
]);

export type UploadParsedT = z.infer<typeof uploadParsedZ>;
