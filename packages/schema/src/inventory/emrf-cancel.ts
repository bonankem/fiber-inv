import { z } from "zod";

export const emrfCancelZ = z.object({
  id: z.uuid(),
  comment: z.string().trim().min(1).max(5000).optional(),
  uploads: z.array(z.uuid()).max(20).default([]),
});

export type EmrfCancelT = z.infer<typeof emrfCancelZ>;