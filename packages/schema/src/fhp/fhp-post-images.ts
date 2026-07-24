import { WorkDocType } from "#/prisma";
import { workUpdateDto } from "#/work";
import { enumWithPrefix, z, zStr } from "../utils";

export const fhpImageTypes = enumWithPrefix(WorkDocType, "FHP_");
export type FhpImageType = (typeof fhpImageTypes)[number];

export const fhpPostImageZ = z.object({
  uploadId: zStr("The upload ID"),
  type: z.enum(fhpImageTypes),
  name: zStr("The name of the pictured element"),
});

export const fhpPostImagesZ = workUpdateDto("FhpPostImagesT", {
  images: z.array(fhpPostImageZ),
  remove: z.array(z.string()).optional(),
});

export type FhpPostImageT = z.infer<typeof fhpPostImageZ>;
export type FhpPostImagesT = z.infer<typeof fhpPostImagesZ>;
