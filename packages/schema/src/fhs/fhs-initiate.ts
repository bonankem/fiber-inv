import { z, zDateOnly, zStrOpt } from "../utils";
import { workUpdateDto } from "../work/work-update";
import { ftthAreaCodeZ } from "./fhs-request";

export const fhsInitiateZ = workUpdateDto("FhsInitiateT", {
  vendorId: zStrOpt("The ID of the vendor to assign, if not already assigned"),
  startDate: zDateOnly("The date on which work is scheduled to start"),
  dueDate: zDateOnly("The due date for completion of work"),
  expectedHp: z.int().describe("Estimate of total HP for the area"),
  isNewArea: z.boolean().describe("Is this survey for a new area?"),
  areaCode: ftthAreaCodeZ.optional(),
});

export type FhsInitiateT = z.infer<typeof fhsInitiateZ>;
