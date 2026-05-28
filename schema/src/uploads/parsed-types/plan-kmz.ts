import { coordsZ } from "#/geo";
import { WorkDocType } from "#/prisma";
import { z, zArray, zObject } from "#/utils";

export const upPlanKmzItemZ = z.object({
  name: z.string(),
  geom: zArray(coordsZ),
});

export const upPlanKmzZ = zObject("UpPlanKmzT", {
  type: z.literal(WorkDocType.PLAN_KMZ),
  metalPoles: z.array(upPlanKmzItemZ),
  concretePoles: z.array(upPlanKmzItemZ),
});

export type UpPlanKmzT = z.infer<typeof upPlanKmzZ>;
