import { z } from "zod";

const emrfUpdateItemZ = z.object({
  equipmentId: z.string().uuid(),
  segment: z.string().trim().min(1),
  position: z.number().int().min(0).default(0),
  requestQty: z.number().int().positive(),
});

export const emrfUpdateZ = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().trim().nullable().optional(),
  items: z.array(emrfUpdateItemZ).min(1).optional(),
});

export type EmrfUpdateT = z.infer<typeof emrfUpdateZ>;
