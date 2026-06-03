import type { z } from "../utils";
import { zStr, zStrOpt } from "../utils";
import { workUpdateDto } from "../work/work-update";

export const fhsAssignZ = workUpdateDto("FhsAssignT", {
  userId: zStr("The ID of the engineer to assign"),
  vendorId: zStrOpt("Optional vendor ID to assign"),
});

export type FhsAssignT = z.infer<typeof fhsAssignZ>;
