import { type Prisma, WorkDocType } from "../db";
import { coordsP, coordsZ } from "../geo";
import { uploadFullP, uploadFullZ } from "../uploads";
import { type Same, z, zObject, zStr } from "../utils";

export const workDocS = {
  id: true,
  type: true,
  key: true,
  upload: uploadFullP,
  coords: coordsP,
} satisfies Prisma.WorkDocSelect;

export const workDocZ = zObject("WorkDocT", {
  id: zStr("The ID of this entry"),
  type: z.enum(WorkDocType).describe("The type of document"),
  key: zStr("The key for distinguishing multiple uploads of the same type"),
  upload: uploadFullZ.describe("The uploaded file"),
  coords: coordsZ.nullable().describe("The GPS location"),
} satisfies Record<keyof typeof workDocS, object>);

export const workDocP = {
  select: workDocS,
  orderBy: [{ type: "asc" }, { key: "asc" }],
} satisfies Prisma.WorkDocFindManyArgs;

type WorkDocP = Prisma.WorkDocGetPayload<typeof workDocP>;
type WorkDocZ = z.infer<typeof workDocZ>;

export type WorkDocT = Same<WorkDocP, WorkDocZ>;
