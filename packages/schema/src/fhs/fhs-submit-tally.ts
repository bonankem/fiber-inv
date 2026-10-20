import { WorkDocType } from "../db";
import { z } from "../utils";
import { workUpdateDto } from "../work";

export const fhsSubmitTallyZ = workUpdateDto("FhsSubmitTallyT", {
  [WorkDocType.FHS_TALLY_KMZ]: z.string(),
  [WorkDocType.FHS_TALLY_TABLE]: z.string(),
  hp: z.number(),
});

export type FhsSubmitTallyT = z.infer<typeof fhsSubmitTallyZ>;
