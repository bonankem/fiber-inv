import { WorkDocType } from "../db";
import { z } from "../utils";
import { workUpdateDto } from "../work";

export const fhsSubmitBomZ = workUpdateDto("FhsSubmitBomT", {
  [WorkDocType.FHS_BOM]: z.string(),
});

export type FhsSubmitBomT = z.infer<typeof fhsSubmitBomZ>;
