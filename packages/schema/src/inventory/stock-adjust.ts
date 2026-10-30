import { z } from "../utils";

export const stockAdjustZ = z.object({
  id: z.uuid(),
  changes: z.int().refine((value) => value !== 0, {
    message: "Stock change cannot be zero",
  }),
  reason: z.string().trim().max(500).optional(),
});

export type StockAdjustT = z.infer<typeof stockAdjustZ>;
