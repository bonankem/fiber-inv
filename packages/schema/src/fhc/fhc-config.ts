import { z } from "../utils";
import { workUpdateDto } from "../work";

export const fhcConfigZ = workUpdateDto("FhcConfigT", {
  oltId: z.string(),
  oltSlot: z.int().min(1).max(18),
  oltPort: z.int().min(1).max(32),
});

export type FhcConfigT = z.infer<typeof fhcConfigZ>;
