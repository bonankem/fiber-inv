import { WorkDocType } from "#/db";
import { z, zArray, zObject } from "../utils";
import { workUpdateDto } from "../work";

export const fhsBomLineZ = zObject("FhsBomLineT", {
  equipmentId: z.string(),
  quantity: z.int().min(1),
});

export const fhsSubmitBomZ = workUpdateDto("FhsSubmitBomT", {
  items: zArray(fhsBomLineZ).min(1),
  [WorkDocType.FHS_BOM]: z.string(),
});

export type FhsBomLineT = z.infer<typeof fhsBomLineZ>;
export type FhsSubmitBomT = z.infer<typeof fhsSubmitBomZ>;
