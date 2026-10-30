import { z } from "zod";

export const emrfRevertZ = z.object({
  id: z.uuid(),
  comment: z.string().trim().min(1).max(2000),
  uploads: z.array(z.uuid()).max(10).default([]),
});

export type EmrfRevertT = z.infer<typeof emrfRevertZ>;
