import { z, zDateOnly, zStrOpt } from "../utils";
import { workUpdateDto } from "../work/work-update";

export const fhsInitiateZ = workUpdateDto("FhsInitiateT", {
  vendorId: zStrOpt("The ID of the vendor to assign, if not already assigned"),
  startDate: zDateOnly("The date on which work is scheduled to start"),
  dueDate: zDateOnly("The due date for completion of work"),
  proposedHp: z.int().describe("Estimate of total HP for the area"),
  isNewArea: z.boolean("Does this survey create a new area code?"),
  areaCode: z
    .string()
    .toUpperCase()
    .regex(/^[A-Z]{5}$/, { error: "Invalid FTTH code" })
    .describe("The five letter FTTH code for new areas"),
  areaId: zStrOpt("The existing area ID, for extensions"),
});

export type FhsInitiateT = z.infer<typeof fhsInitiateZ>;
