import z from "zod";
import * as p from "./parsed-types";

export const uploadParsedZ = z.discriminatedUnion("type", [
  p.upPlaqueKmzZ,
  p.upFhsCoordsZ,
]);

export type UploadParsedT = z.infer<typeof uploadParsedZ>;
