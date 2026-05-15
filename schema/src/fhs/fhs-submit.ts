import { WorkDocType as Doc } from "../prisma";
import { z, zStr, zStrNul } from "../utils";
import { workUpdateDto } from "../work/work-update";

export const fhsSubmitZ = workUpdateDto("FhsSubmitT", {
  existingOltId: zStrNul("ID of the existing OLT, if any").optional(),
  hpPavillon: z.int('Number of "pavillon" HPs/ELs'),
  hpImmeuble: z.int('Number of "immeuble" HPs/ELs'),
  newOlts: z.int("Number of new olts"),
  oltCards: z.int("Number of olt cards"),
  hubBoxes: z.int("Number of hub boxes"),
  subBoxes: z.int("Number of sub boxes"),
  endBoxes: z.int("Number of end boxes"),
  manholes: z.int("Number of manholes"),
  closures: z.int("Number of closures"),
  metalPoles: z.int("Number of metal poles"),
  concretePoles: z.int("Number of concrete poles"),
  feederLengthM: z.int("Total feeder cable length in metres"),
  distLengthM: z.int("Total distribution cable length in metres"),

  [Doc.PLAN_KMZ]: zStr("KMZ upload ID"),
  [Doc.PLAN_BOQ]: zStr("BOQ upload ID"),
  [Doc.PLAN_DIAGRAM]: zStr("plan diagram upload ID"),
  [Doc.SYNOPTIC_TABLE]: zStr("synoptic table upload ID"),
  [Doc.SYNOPTIC_DIAGRAM]: zStr("synoptic diagram upload ID "),
});

export type FhsSubmitT = z.infer<typeof fhsSubmitZ>;
