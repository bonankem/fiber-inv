import { z, zFormObject, zStr, zStrOpt } from "../utils";

export const oltCreateZ = zFormObject("OltCreateT", {
  name: zStr("The OLT name"),
  oem: zStr("The OEM ID or key"),
  site: zStrOpt("The site ID"),
  ip: zStrOpt("The OLT IP address"),
});

const oltCreateItemsZ = z.object({
  items: z.array(oltCreateZ).describe("OLTs to create"),
  ignoreExisting: z.boolean().optional(),
});

const oltCreateNamesZ = z.object({
  names: z.array(z.string()).describe("Names of OLTs to create"),
  oem: zStr("The OEM ID or key"),
  ignoreExisting: z.boolean().optional(),
});

export const oltCreateManyZ = z.union([oltCreateItemsZ, oltCreateNamesZ]);

export type OltCreateT = z.infer<typeof oltCreateZ>;
export type OltCreateManyT = z.infer<typeof oltCreateManyZ>;
