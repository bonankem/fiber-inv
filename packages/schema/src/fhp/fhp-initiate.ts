import { type z, zDateOnly, zStrOpt } from "../utils";
import { workUpdateDto } from "../work/work-update";

export const fhpInitiateZ = workUpdateDto("FhpInitiateT", {
  vendorId: zStrOpt("The ID of the vendor to assign"),
  startDate: zDateOnly("The date on which work is scheduled to start"),
  dueDate: zDateOnly("The due date for completion of work"),
});

export type FhpInitiateT = z.infer<typeof fhpInitiateZ>;
