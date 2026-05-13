import {
  type Prisma,
  type PrismaToZod,
  type Same,
  z,
  zDate,
  zObject,
  zStr,
} from "../base";
import { type UploadParsedT, uploadParsedZ } from "./parsed";

declare global {
  namespace PrismaJson {
    type UploadParsedJson = UploadParsedT;
  }
}

export const uploadFullS = {
  id: true,
  name: true,
  size: true,
  type: true,
  madeAt: true,
  sentAt: true,
  parsed: true,
} satisfies Prisma.UploadSelect;

export const uploadFullZ = zObject("UploadT", {
  id: zStr("The upload ID"),
  name: zStr("The file name"),
  type: zStr("The MIME type"),
  size: z.int().describe("The size in bytes"),
  madeAt: zDate("File creation date/time").nullable(),
  sentAt: zDate("File upload date/time"),
  parsed: uploadParsedZ.nullable(),
} satisfies PrismaToZod<typeof uploadFullS>);

export const uploadFullP = { select: uploadFullS };

type UploadFullP = Prisma.UploadGetPayload<typeof uploadFullP>;
type UploadFullZ = z.infer<typeof uploadFullZ>;

export type UploadFullT = Same<UploadFullP, UploadFullZ>;
