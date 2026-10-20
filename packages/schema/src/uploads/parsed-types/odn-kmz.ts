import { WorkDocType } from "#/db";
import { coordsZ } from "#/geo";
import { z, zArray, zObject } from "#/utils";
import { upFhsBoxZ } from "./fhs-coords";

export const upOdnKmzItemZ = z.object({
  name: z.string(),
  geom: zArray(coordsZ),
  oldName: z.string().optional(),
});

export enum OdnKmzIssue {
  INCORRECT_BOX_NAME,
  INCORRECT_CABLE_NAME,
}

export const upOdnKmzIssueZ = z.object({
  type: z.enum(OdnKmzIssue),
  name: z.string(),
});

export const upOdnKmzItemsZ = z.array(upOdnKmzItemZ);

export const upOdnKmzZ = zObject("UpOdnKmzT", {
  type: z.enum([WorkDocType.FHS_SIZING_KMZ, WorkDocType.FHP_ODN_KMZ]),
  boxes: z.array(upFhsBoxZ),
  cables: upOdnKmzItemsZ,
  metalPoles: upOdnKmzItemsZ,
  concretePoles: upOdnKmzItemsZ,
  issues: z.array(upOdnKmzIssueZ),
});

export type UpOdnKmzT = z.infer<typeof upOdnKmzZ>;

export type UpOdnKmzIssueT = z.infer<typeof upOdnKmzIssueZ>;
