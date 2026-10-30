import {z} from "zod";

export const emrfAssignToZ = z.object({
    id: z.string().uuid(),
    orderNumber: z.string().trim().min(1).max(100),
    comment: z.string().trim().min(1).max(5000).optional(),
uploads: z.array(z.uuid()).max(20).default([]),
});

export type EmrfAssignToT = z.infer<typeof emrfAssignToZ>;