import { coordsZ } from "#/geo";
import { z, zObject, zStr, zStrOpt } from "../utils";

export const fhcRequestZ = zObject("FhcRequestT", {
  fn: zStr("Fibre number"),
  name: zStr("Customer name"),
  email: zStrOpt("Customer email address"),
  phone: zStrOpt("Customer phone number"),
  address: zStr("Location address"),
  coords: coordsZ.describe("Location coordinates"),
  localityId: zStr("Locality ID"),
  vendorId: zStr("Vendor ID"),
  startDate: zStrOpt("Scheduled date"),
  comment: zStrOpt("Added comment"),
  uploads: z.array(z.string()).optional(),
});

export type FhcRequestT = z.infer<typeof fhcRequestZ>;
