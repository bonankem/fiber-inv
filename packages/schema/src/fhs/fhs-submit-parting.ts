import { WorkDocType } from "#/db";
import { workUpdateDto } from "#/work";
import { z } from "../utils";

export const fhsSubmitPartingZ = workUpdateDto("FhsSubmitPartingT", {
  [WorkDocType.FHS_PARTING_KMZ]: z.string(),
  clusters: z.int(),
});

export type FhsSubmitPartingT = z.infer<typeof fhsSubmitPartingZ>;
