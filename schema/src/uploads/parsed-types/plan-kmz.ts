import { WorkDocType } from "#/prisma";
import { z, zObject } from "#/utils";

export const upPlanKmzZ = zObject("UpPlanKmzT", {
  type: z.literal(WorkDocType.PLAN_KMZ),
  text: z.any(),
});

export type UpPlanKmzT = z.infer<typeof upPlanKmzZ>;
