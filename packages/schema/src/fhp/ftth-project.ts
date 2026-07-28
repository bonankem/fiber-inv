import { workP, workZ } from "#/work";
import type { Prisma } from "../prisma";
import { type Same, z, zObject, zStr, zStrNul } from "../utils";

const fhpReportS = {
  xBoxes: true,
  hubBoxes: true,
  fats: true,
  manholes: true,
  closures: true,
  metalPoles: true,
  concretePoles: true,
  transportMetres: true,
  distMetres: true,
} satisfies Prisma.FhpReportSelect;

const fhpReportZ = zObject("FhpReportT", {
  xBoxes: z.int(),
  hubBoxes: z.int(),
  fats: z.int(),
  manholes: z.int(),
  closures: z.int(),
  metalPoles: z.int(),
  concretePoles: z.int(),
  transportMetres: z.int(),
  distMetres: z.int(),
} satisfies Record<keyof typeof fhpReportS, object>);

export const fhpReportP = { select: fhpReportS };

export const fhpReportListP = {
  select: fhpReportS,
} satisfies Prisma.FhpReportFindManyArgs;

type FhpReportP = Prisma.FhpReportGetPayload<typeof fhpReportP>;
type FhpReportZ = z.infer<typeof fhpReportZ>;

export type FhpReportT = Same<FhpReportP, FhpReportZ>;

export const ftthProjectS = {
  id: true,
  work: workP,
  surveyId: true,
  hp: true,
  report: fhpReportP,
} satisfies Prisma.FtthProjectSelect;

export const ftthProjectZ = zObject("FtthProjectT", {
  id: zStr("The work entry UUID"),
  work: workZ,
  surveyId: zStrNul("The ID of the related survey"),
  hp: z.int().describe("Reported HP"),
  report: fhpReportZ.nullable(),
} satisfies Record<keyof typeof ftthProjectS, object>);

export const ftthProjectP = { select: ftthProjectS };

type FtthProjectP = Prisma.FtthProjectGetPayload<typeof ftthProjectP>;
type FtthProjectZ = z.infer<typeof ftthProjectZ>;

export type FtthProjectT = Same<FtthProjectP, FtthProjectZ>;
