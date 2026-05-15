import { coordsZ } from "../geo";
import { z, zFormObject } from "../utils";

export const fhsRequestZ = zFormObject("FhsRequestT", {
  PLAQUE_KMZ: z.uuid(),
  name: z.string(),
  localityId: z.string(),
  managerId: z.string(),
  coords: coordsZ,
  contact: z.string(),
  comment: z.string().optional(),
  uploads: z.array(z.uuid()).optional(),
});

export type FhsRequestT = z.infer<typeof fhsRequestZ>;
