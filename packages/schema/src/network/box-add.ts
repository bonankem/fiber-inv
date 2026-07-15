import { coordsZ } from "#/geo";
import { z, zObject } from "../utils";

export const boxAddZ = zObject("BoxAddT", {
  name: z.string(),
  coords: coordsZ,
  oemId: z.string().optional(),
  oltId: z.string().optional(),
});

export const boxAddManyZ = zObject("BoxAddManyT", {
  items: boxAddZ.array(),
  oem: z.string().optional(),
  olt: z.string().optional(),
});

export type BoxAddT = z.infer<typeof boxAddZ>;

export type BoxAddManyT = z.infer<typeof boxAddManyZ>;
