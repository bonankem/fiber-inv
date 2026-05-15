import { z } from "../utils";
import { workUpdateDto } from "../work/work-update";

export const fhsReviewZ = workUpdateDto("FhsReviewT", {
  passed: z.boolean().describe("True if passed, false if failed"),
});

export type FhsReviewT = z.infer<typeof fhsReviewZ>;
