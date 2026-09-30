import { WorkDocType as Doc } from "../db";
import { z, zStr } from "../utils";
import { workUpdateDto } from "../work/work-update";

export const fhsSubmitZ = workUpdateDto("FhsSubmitT", {
  hp: z.int("Number of HPs/ELs"),
  oltCards: z.int("Number of OLT cards"),
  xBoxes: z.int("Number of X boxes"),
  hubBoxes: z.int("Number of hub boxes"),
  fats: z.int("Number of FATs"),
  manholes: z.int("Number of new manholes"),
  closures: z.int("Number of closures"),
  metalPoles: z.int("Number of metal poles"),
  concretePoles: z.int("Number of concrete poles"),
  transportLength: z.int("Total transport cable length in metres"),
  distLength: z.int("Total distribution cable length in metres"),

  // [Doc.ODN_KMZ]: zStr("KMZ upload ID"),
  // [Doc.BOQ]: zStr("BOQ upload ID"),
  [Doc.PLAN_DIAGRAM]: zStr("Plan diagram upload ID"),
  [Doc.SYNOPTIC_TABLE]: zStr("Synoptic table upload ID"),
  [Doc.SYNOPTIC_DIAGRAM]: zStr("Synoptic diagram upload ID"),
  [Doc.COORDINATES]: zStr("Coordinates table upload ID"),
  // [Doc.CABLE_LENGTHS]: zStr("Cable lengths upload ID"),
  [Doc.HP_SUMMARY]: zStr("Summary of HP distribution"),
});

export type FhsSubmitT = z.infer<typeof fhsSubmitZ>;
