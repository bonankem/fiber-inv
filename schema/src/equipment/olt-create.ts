import { z, zFormObject, zStr, zStrOpt } from "../utils";

export const oltCreateZ = zFormObject("OltCreateT", {
  name: zStr("The name of the OLT"),
  oem: zStrOpt("The ID (or key) of the OEM"),
  ip: zStrOpt("The IP address of the OLT"),
  mtnSite: zStrOpt("The MTN site ID"),
});

export const oltCreateManyZ = z.object({
  items: z
    .array(oltCreateZ)
    .optional()
    .describe("An entry for each OLT to create"),
  names: z
    .array(z.string())
    .optional()
    .describe("An additional list, for use when only names are being given"),
  oem: zStrOpt("The fallback OEM ID/key for items where it is not specified"),
  ignoreExisting: z.boolean().optional(),
});

export type OltCreateT = z.infer<typeof oltCreateZ>;
export type OltCreateManyT = z.infer<typeof oltCreateManyZ>;
