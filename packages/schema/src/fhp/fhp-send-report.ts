import { workUpdateDto } from "#/work";
import { WorkDocType as Doc } from "../prisma";
import { z, zStr } from "../utils";

export const fhpSendReportZ = workUpdateDto("FhpReportT", {
  xBoxes: z.int("Number of X boxes"),
  hubBoxes: z.int("Number of hub boxes"),
  subBoxes: z.int("Number of sub boxes"),
  endBoxes: z.int("Number of end boxes"),
  manholes: z.int("Number of manholes"),
  closures: z.int("Number of closures"),
  metalPoles: z.int("Number of metal poles"),
  concretePoles: z.int("Number of concrete poles"),
  transportMetres: z.int("Total transport cable length in metres"),
  distMetres: z.int("Total distribution cable length in metres"),

  [Doc.AS_BUILT_KMZ]: zStr("KMZ upload ID"),
  [Doc.AS_BUILT_BOQ]: zStr("BOQ upload ID"),
});

export type FhpSendReportT = z.infer<typeof fhpSendReportZ>;
