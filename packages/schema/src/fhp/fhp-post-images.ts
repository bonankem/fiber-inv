import { FhpImageType } from "#/prisma";
import { workUpdateDto } from "#/work";
import { z, zStr } from "../utils";

export const fhpPostImageZ = z.object({
  uploadId: zStr("The upload ID"),
  type: z.enum(FhpImageType),
  name: zStr("The name of the pictured element"),
});

export const fhpPostImagesZ = workUpdateDto("FhpPostImagesT", {
  images: z.array(fhpPostImageZ),
  remove: z.array(z.string()).optional(),
});

export type FhpPostImagesT = z.infer<typeof fhpPostImagesZ>;
