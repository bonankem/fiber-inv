import { z, zObject } from "../common";

export const fhsRequestZ = zObject("FhsRequestT", {
  PLAQUE_KMZ: z.uuid(),
  name: z.string(),
  cityId: z.string(),
  lat: z.int().min(-90).max(90),
  lng: z.int().min(-180).max(180),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),

  comment: z.string().optional(),
  uploads: z.array(z.uuid()),
});

export type FhsRequestT = z.infer<typeof fhsRequestZ>;
