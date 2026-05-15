import type { ZodRawShape } from "zod";
import { z, zArray, zFormObject, zObject, zStr, zStrOpt } from "../utils";

export const workUpdateZ = zObject("WorkUpdateT", {
  id: zStr("The work ID"),
  comment: zStrOpt("The comment to add"),
  uploads: zArray(z.string()).optional().describe("IDs of uploads to attach"),
});

export type WorkUpdateT = z.infer<typeof workUpdateZ>;

export function workUpdateDto<T extends ZodRawShape>(id: string, shape: T) {
  return zFormObject(id, { ...workUpdateZ.shape, ...shape });
}
