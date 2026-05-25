import { coordsZ } from "#/geo";
import { z, zObject } from "../utils";

export const fhpRequestZ = zObject("FhpRequestT", {
  name: z.string(),
  surveyId: z.string(),
  localityId: z.string(),
  managerId: z.string(),
  hp: z.int().optional(),
  coords: coordsZ,
  contact: z.string(),
  comment: z.string().optional(),
  uploads: z.array(z.uuid()).optional(),
});

export type FhpRequestT = z.infer<typeof fhpRequestZ>;
