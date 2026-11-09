import z from "zod";
import * as p from "./parsed-types";

export const uploadParsedZ = z.discriminatedUnion("type", [
  p.upAreaKmzZ,
  p.upOdnKmzZ,
  p.upFhsCoordsZ,
  p.upFhsBomZ,
]);

export type UploadParsedT = z.infer<typeof uploadParsedZ>;

declare global {
  namespace PrismaJson {
    type UploadParsedJson = UploadParsedT;
  }
}
