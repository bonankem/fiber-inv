import { workUpdateDto } from "#/work";
import { type z, zStr, zStrOpt } from "../utils";

export const fhpAssignZ = workUpdateDto("FhpAssignT", {
  userId: zStr("The ID of the engineer to assign"),
  vendorId: zStrOpt("Optional vendor ID to assign"),
});

export type FhpAssignT = z.infer<typeof fhpAssignZ>;
