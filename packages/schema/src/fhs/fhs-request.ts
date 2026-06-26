import { coordsZ } from "../geo";
import { z, zFormObject } from "../utils";

export const ftthAreaCodeZ = z
  .string()
  .toUpperCase()
  .regex(/^[A-Z]{5}$/, { error: "Invalid area code" })
  .describe("The five letter FTTH area code");

export const fhsRequestZ = zFormObject("FhsRequestT", {
  PLAQUE_KMZ: z.uuid(),
  name: z.string(),
  localityId: z.string(),
  isNewArea: z.boolean().describe("Is this survey for a new area?"),
  areaCode: z.string().describe("The 5 letter area code"),
  managerId: z.string(),
  coords: coordsZ,
  contact: z.string(),
  comment: z.string().optional(),
  uploads: z.array(z.uuid()).optional(),
});

export type FhsRequestT = z.infer<typeof fhsRequestZ>;
