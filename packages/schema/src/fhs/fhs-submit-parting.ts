import { WorkDocType } from "../db";
import { z } from "../utils";
import { workUpdateDto } from "../work";

export const fhsSubmitPartingZ = workUpdateDto("FhsSubmitPartingT", {
  [WorkDocType.FHS_PARTING_KMZ]: z.string(),
  clusters: z.int(),
});

export type FhsSubmitPartingT = z.infer<typeof fhsSubmitPartingZ>;
