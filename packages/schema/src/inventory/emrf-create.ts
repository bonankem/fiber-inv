import { z } from "zod";
export const emrfCreateItemZ = z.object({
  equipmentId: z.string().uuid(),
  segment: z.string().trim().min(1),
  position: z.number().int().min(0).default(0),
  requestQty: z.number().int().positive(),
});

export const emrfCreateZ = z.object({
  // The closed HP Planning job the materials are for
  surveyId: z.uuid(),
  items: z.array(emrfCreateItemZ).min(1),

  // Comment and attachments for the creation action
  comment: z.string().trim().min(1).max(5000).optional(),
  uploads: z.array(z.uuid()).max(20).default([]),
});
export type EmrfCreateT = z.input<typeof emrfCreateZ>;
