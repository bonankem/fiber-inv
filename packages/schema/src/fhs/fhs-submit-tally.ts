import { WorkDocType } from "#/db";
import { workUpdateDto } from "#/work";
import { z } from "../utils";

export const fhsSubmitTallyZ = workUpdateDto("FhsSubmitTallyT", {
  [WorkDocType.FHS_TALLY_KMZ]: z.string(),
  [WorkDocType.FHS_TALLY_TABLE]: z.string(),
  hp: z.number(),
});

export type FhsSubmitTallyT = z.infer<typeof fhsSubmitTallyZ>;
