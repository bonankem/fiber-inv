import { type Prisma, type Same, z, zObject, zStr } from "../common";

export const uploadS = {
  id: true,
  name: true,
  size: true,
  type: true,
} satisfies Prisma.UploadSelect;

export const uploadZ = zObject("UploadT", {
  id: zStr("The upload ID"),
  name: zStr("The file name"),
  type: zStr("The MIME type"),
  size: z.int().describe("The size in bytes"),
} satisfies Record<keyof typeof uploadS, object>);

export const uploadP = { select: uploadS };

type UploadP = Prisma.UploadGetPayload<typeof uploadP>;
type UploadZ = z.infer<typeof uploadZ>;

export type UploadT = Same<UploadP, UploadZ>;
