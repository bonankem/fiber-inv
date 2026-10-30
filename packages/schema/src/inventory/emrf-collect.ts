import { z } from "zod";

export const emrfCollectItemZ = z.object({
  itemId: z.uuid(),
  // may be less than requested if the current stock was short, but never more
  collectedQty: z.number().int().min(0),
});

export const emrfCollectZ = z.object({
  id: z.uuid(),
  // every line of the EMRF, since an EMRF is collected in one go
  items: z.array(emrfCollectItemZ).min(1),
  comment: z.string().trim().min(1).optional(),
  uploads: z.array(z.uuid()).max(20).default([]),
});

export type EmrfCollectT = z.infer<typeof emrfCollectZ>;
