import { WorkDocType } from "../../db";
import { fhsBomEquipmentZ } from "../../fhs/fhs-bom-item";
import { z, zObject, zStr } from "../../utils";

export const upFhsBomLineZ = z.object({
  code: zStr("The item code as written in the BOQ"),
  quantity: z.int().describe("The quantity from the BOQ"),
  equipment: fhsBomEquipmentZ
    .nullable()
    .describe("The inventory item with this MTN code, if any"),
});

export type UpFhsBomLineT = z.infer<typeof upFhsBomLineZ>;

export const upFhsBomZ = zObject("UpFhsBomT", {
  type: z.literal(WorkDocType.FHS_BOM),
  lines: z.array(upFhsBomLineZ),
});

export type UpFhsBomT = z.infer<typeof upFhsBomZ>;
