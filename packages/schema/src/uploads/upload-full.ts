import type { Prisma } from "../db";
import {
  type PrismaToZod,
  type Same,
  z,
  zDate,
  zDateNul,
  zObject,
  zStr,
} from "../utils";
import { uploadParsedZ } from "./parsed";

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
  madeAt: zDateNul("File creation date/time"),
  sentAt: zDate("File upload date/time"),
  parsed: uploadParsedZ.nullable(),
} satisfies PrismaToZod<typeof uploadFullS>);

export const uploadFullP = { select: uploadFullS };

type UploadFullP = Prisma.UploadGetPayload<typeof uploadFullP>;
type UploadFullZ = z.infer<typeof uploadFullZ>;

export type UploadFullT = Same<UploadFullP, UploadFullZ>;
