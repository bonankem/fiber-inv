import { z } from "zod";

export { z } from "zod";

export * from "./generated/browser";

export function zObject<T extends z.ZodRawShape>(id: string, shape: T) {
  return z.strictObject(shape).meta({ id });
}

export const zStr = (desc: string) => z.string().describe(desc);
export const zStrNul = (desc: string) => zStr(desc).nullable();
export const zStrOpt = (desc: string) => zStr(desc).optional();

export const zEnumUpper = <E extends Record<string, string>>(e: E) =>
  z.string().toUpperCase().pipe(z.enum(e));

export type Same<A extends B, B> = A;
