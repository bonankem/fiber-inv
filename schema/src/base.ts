import { z } from "zod";

export { z } from "zod";

export * from "./generated/browser";

export function zObject<T extends z.ZodRawShape>(id: string, shape: T) {
  return z.strictObject(shape).meta({ id });
}

export const zStr = (desc: string) => z.string().describe(desc);
export const zStrNul = (desc: string) => zStr(desc).nullable();
export const zStrOpt = (desc: string) => zStr(desc).optional();

function tryDate(d: unknown) {
  if (d instanceof Date) return d;
  if (typeof d !== "string") return d;
  const date = new Date(d);
  return date.getTime() ? date : d;
}

export const zDate = (desc: string) =>
  z.preprocess(tryDate, z.date().describe(desc));

export const zDateNul = (desc: string) =>
  z.preprocess(tryDate, z.date().describe(desc));

export const zEnumUpper = <E extends Record<string, string>>(e: E) =>
  z.string().toUpperCase().pipe(z.enum(e));

export type Same<_ extends Zod, Zod> = Zod;

export type PrismaToZod<P> = { [K in keyof P]: object };
