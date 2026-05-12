import { z } from "../common";
import { coordsZ } from "../geo";
import { zFormObject } from "../utils";

export const fhsRequestZ = zFormObject("FhsRequestT", {
  PLAQUE_KMZ: z.uuid(),
  name: z.string(),
  localityId: z.string(),
  managerId: z.string(),
  coords: coordsZ.optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),

  comment: z.string().optional(),
  uploads: z.array(z.uuid()).optional(),
});

export type FhsRequestT = z.infer<typeof fhsRequestZ>;
