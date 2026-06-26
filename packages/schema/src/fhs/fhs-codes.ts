import { z, zObject } from "../utils";

export const fhsCodesUrl = "/fhs/codes";

export const fhsCodeZ = zObject("FhsCodeT", {
  code: z.string(),
  name: z.string(),
  key: z.string(),
  works: z.array(z.string()),
});

export const fhsCodesZ = z.array(fhsCodeZ);

export type FhsCodeT = z.infer<typeof fhsCodeZ>;
export type FhsCodesT = z.infer<typeof fhsCodesZ>;
