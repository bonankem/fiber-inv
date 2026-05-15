import { z, zDateOnly, zStrOpt } from "../utils";
import { workUpdateDto } from "../work/work-update";

export const fhsInitiateZ = workUpdateDto("FhsInitiateT", {
  vendorId: zStrOpt("The ID of the vendor to assign"),
  proposedHp: z.int().describe("Estimate of total HP for the area"),
  startDate: zDateOnly("The date on which work is scheduled to start"),
  dueDate: zDateOnly("The due date for completion of work"),
});

export type FhsInitiateT = z.infer<typeof fhsInitiateZ>;
