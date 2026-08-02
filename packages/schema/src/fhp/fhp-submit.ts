import { workUpdateDto } from "#/work";
import { WorkDocType as Doc } from "../db";
import { z, zStr } from "../utils";

export const fhpSubmitZ = workUpdateDto("FhpSubmitT", {
  xBoxes: z.int("Number of X boxes"),
  hubBoxes: z.int("Number of hub boxes"),
  fats: z.int("Number of FATs"),
  manholes: z.int("Number of manholes"),
  closures: z.int("Number of closures"),
  metalPoles: z.int("Number of metal poles"),
  concretePoles: z.int("Number of concrete poles"),
  transportMetres: z.int("Total transport cable length in metres"),
  distMetres: z.int("Total distribution cable length in metres"),

  [Doc.ODN_KMZ]: zStr("KMZ upload ID"),
  [Doc.BOQ]: zStr("BOQ upload ID"),
});

export type FhpSubmitT = z.infer<typeof fhpSubmitZ>;
