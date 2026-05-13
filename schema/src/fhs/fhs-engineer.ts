import { z, zStr, zStrOpt } from "../base";
import { zFormObject } from "../utils";

export const fhsEngineerZ = zFormObject("FhsEngineerT", {
  id: zStr("The survey ID"),
  userId: zStr("The ID of the engineer to assign"),
  vendorId: zStrOpt("Optional vendor ID to assign"),
  comment: zStrOpt("Comment"),
  uploads: z.array(z.uuid()).optional(),
});

export type FhsEngineerT = z.infer<typeof fhsEngineerZ>;
