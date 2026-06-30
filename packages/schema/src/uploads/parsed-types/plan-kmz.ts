import { coordsZ } from "#/geo";
import { WorkDocType } from "#/prisma";
import { z, zArray, zObject } from "#/utils";
import { upFhsBoxZ } from "./fhs-coords";

export const upPlanKmzItemZ = z.object({
  name: z.string(),
  geom: zArray(coordsZ),
  oldName: z.string().optional(),
});

export enum PlanKmzIssue {
  INCORRECT_BOX_NAME,
  INCORRECT_CABLE_NAME,
}

export const upPlanKmzIssueZ = z.object({
  type: z.enum(PlanKmzIssue),
  name: z.string(),
});

export const upPlanKmzItemsZ = z.array(upPlanKmzItemZ);

export const upPlanKmzZ = zObject("UpPlanKmzT", {
  type: z.literal(WorkDocType.PLAN_KMZ),
  boxes: z.array(upFhsBoxZ),
  cables: upPlanKmzItemsZ,
  metalPoles: upPlanKmzItemsZ,
  concretePoles: upPlanKmzItemsZ,
  issues: z.array(upPlanKmzIssueZ),
});

export type UpPlanKmzT = z.infer<typeof upPlanKmzZ>;

export type UpPlanKmzIssueT = z.infer<typeof upPlanKmzIssueZ>;
