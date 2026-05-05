import { z, zStr, zStrOpt } from "../common";
import { zFormObject } from "../utils";

export const fhsVendorZ = zFormObject("FhsVendorT", {
  id: zStr("The survey ID"),
  vendorId: zStr("The ID of the vendor to assign"),
  comment: zStrOpt("Comment"),
  uploads: z.array(z.uuid()).optional(),
});

export type FhsVendorT = z.infer<typeof fhsVendorZ>;
