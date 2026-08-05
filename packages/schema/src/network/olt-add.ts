import { z, zFormObject, zStr, zStrOpt } from "../utils";

export const oltAddZ = zFormObject("OltAddT", {
  name: zStr("The OLT name"),
  oem: zStr("The OEM ID or key"),
  site: zStrOpt("The site ID"),
  ip: zStrOpt("The OLT IP address"),
});

const oltAddItemsZ = z.object({
  items: z.array(oltAddZ).describe("OLTs to Add"),
  ignoreExisting: z.boolean().optional(),
});

const oltAddNamesZ = z.object({
  names: z.array(z.string()).describe("Names of OLTs to Add"),
  oem: zStr("The OEM ID or key"),
  ignoreExisting: z.boolean().optional(),
});

export const oltAddManyZ = oltAddNamesZ;

export type OltAddT = z.infer<typeof oltAddZ>;
export type OltAddManyT = z.infer<typeof oltAddManyZ>;
