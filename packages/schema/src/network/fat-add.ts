import { coordsZ } from "../geo";
import { z, zObject } from "../utils";

export const fatAddZ = zObject("FatAddT", {
  name: z.string(),
  coords: coordsZ.optional(),
  oltId: z.string().optional(),
});

export const fatAddManyZ = zObject("FatAddManyT", {
  items: fatAddZ.array(),
  olt: z.string().optional(),
});

export type FatAddT = z.infer<typeof fatAddZ>;

export type FatAddManyT = z.infer<typeof fatAddManyZ>;
