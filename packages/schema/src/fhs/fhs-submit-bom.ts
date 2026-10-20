import { WorkDocType } from "#/db";
import { workUpdateDto } from "#/work";
import { z } from "../utils";

export const fhsSubmitBomZ = workUpdateDto("FhsSubmitBomT", {
  [WorkDocType.FHS_BOM]: z.string(),
});

export type FhsSubmitBomT = z.infer<typeof fhsSubmitBomZ>;
