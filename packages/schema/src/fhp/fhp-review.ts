import { z } from "../utils";
import { workUpdateDto } from "../work/work-update";

export const fhpReviewZ = workUpdateDto("FhpReviewT", {
  passed: z.boolean().describe("True if passed, false if failed"),
});

export type FhpReviewT = z.infer<typeof fhpReviewZ>;
