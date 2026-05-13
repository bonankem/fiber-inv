import { type z, zStr } from "../base";
import { zFormObject } from "../utils";

export const vendorCreateZ = zFormObject("VendorCreateT", {
  name: zStr("The name of the vendor to create"),
});

export type VendorCreateT = z.infer<typeof vendorCreateZ>;
