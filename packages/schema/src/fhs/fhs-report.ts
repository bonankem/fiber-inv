import type { Prisma } from "../prisma";
import { type Same, z, zObject, zStr } from "../utils";

export const fhsReportS = {
  id: true,
  surveyId: true,
  submitDate: true,
  hp: true,
  oltCards: true,
  xBoxes: true,
  hubBoxes: true,
  subBoxes: true,
  endBoxes: true,
  closures: true,
  manholes: true,
  metalPoles: true,
  concretePoles: true,
  oldManholes: true,
  oldPoles: true,
  transportLength: true,
  distLength: true,
  ductLength: true,
} satisfies Prisma.FhsReportSelect;

export const fhsReportZ = zObject("FhsReportT", {
  id: zStr("The report ID"),
  surveyId: zStr("The survey ID"),
  submitDate: zStr("The date of submission"),
  hp: z.int(),
  oltCards: z.int(),
  xBoxes: z.int(),
  hubBoxes: z.int(),
  subBoxes: z.int(),
  endBoxes: z.int(),
  manholes: z.int(),
  closures: z.int(),
  metalPoles: z.int(),
  concretePoles: z.int(),
  oldManholes: z.int(),
  oldPoles: z.int(),
  transportLength: z.int(),
  distLength: z.int(),
  ductLength: z.int(),
} satisfies Record<keyof typeof fhsReportS, object>);

export const fhsReportP = { select: fhsReportS };

type FhsReportP = Prisma.FhsReportGetPayload<typeof fhsReportP>;
type FhsReportZ = z.infer<typeof fhsReportZ>;

export type FhsReportT = Same<FhsReportP, FhsReportZ>;
