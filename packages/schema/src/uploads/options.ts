import z from "zod";
import { WorkDocType } from "../db";
import { zFormObject } from "../utils";

export const uploadOptionsZ = zFormObject("UploadQueryT", {
  id: z.uuidv7().optional(),
  parser: z.enum(WorkDocType).optional(),
  noSave: z.coerce.boolean().default(false),
});

export type UploadOptionsT = z.infer<typeof uploadOptionsZ>;
