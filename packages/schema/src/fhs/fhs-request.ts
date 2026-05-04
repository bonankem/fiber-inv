import { z } from "../common";
import { zFormObject } from "../utils";

export const fhsRequestZ = zFormObject("FhsRequestT", {
  PLAQUE_KMZ: z.uuid(),
  name: z.string(),
  cityId: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),

  comment: z.string().optional(),
  uploads: z.array(z.uuid()).optional(),
});

export type FhsRequestT = z.infer<typeof fhsRequestZ>;
