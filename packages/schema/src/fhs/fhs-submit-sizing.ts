import { WorkDocType } from "#/db";
import { workUpdateDto } from "#/work";
import { z } from "../utils";

export const fhsSubmitSizingZ = workUpdateDto("FhsSubmitSizingT", {
  [WorkDocType.FHS_SIZING_KMZ]: z.string(),
  [WorkDocType.FHS_COORDINATES]: z.string(),
  [WorkDocType.FHS_SYNOPTIC_TABLE]: z.string(),
  [WorkDocType.FHS_SYNOPTIC_DIAGRAM]: z.string(),
  [WorkDocType.FHS_PLAN_DIAGRAM]: z.string(),
  [WorkDocType.FHS_CABLE_LENGTHS]: z.string(),
  fats: z.int("Number of FATs"),
  xBoxes: z.int("Number of X boxes"),
  hubBoxes: z.int("Number of hub boxes"),
  manholes: z.int("Number of new manholes"),
  closures: z.int("Number of closures"),
  metalPoles: z.int("Number of metal poles"),
  concretePoles: z.int("Number of concrete poles"),
  transportLength: z.int("Total transport cable length in metres"),
  distLength: z.int("Total distribution cable length in metres"),
});

export type FhsSubmitSizingT = z.infer<typeof fhsSubmitSizingZ>;
