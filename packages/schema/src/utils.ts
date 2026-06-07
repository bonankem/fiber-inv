import type { ZodRawShape, ZodType } from "zod";
import z from "zod";

export { z } from "zod";

const nilId = "00000000-0000-0000-0000-000000000000";
export const whereNone = { id: nilId };

export function zArray<T>(zt: ZodType<T>) {
  return z.array(zt);
}

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
  z.preprocess(tryDate, z.date().nullable().describe(desc));

export const zDateOnly = (desc: string) => z.iso.date().describe(desc);

export const zEnumUpper = <E extends Record<string, string>>(e: E) =>
  z.string().toUpperCase().pipe(z.enum(e));

export type Same<_ extends Zod, Zod> = Zod;

export type PrismaToZod<P> = {
  [K in keyof P]: object;
};

export type { ZodType } from "zod";

function prepText(v: unknown) {
  return typeof v === "string" ? v.trim() || undefined : v;
}

function prepBool(v: unknown) {
  if (typeof v !== "string") return v;
  if (v === "") return undefined;
  if (v === "false") return false;
  if (v === "true") return true;
  if (v === "on") return true;
  return v;
}

function prepNum(v: unknown) {
  if (!v || typeof v !== "string") return v;
  if (v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}

function prepArray(v: unknown) {
  if (Array.isArray(v)) return v;
  if (v === "") return undefined;
  if (v === null || v === undefined) return v;
  return [v];
}

type ZType = ZodRawShape[keyof ZodRawShape];

function prepFunc(t: ZType) {
  if (t instanceof z.ZodOptional) return prepFunc(t.unwrap());
  if (t instanceof z.ZodDefault) return prepFunc(t.unwrap());
  if (t instanceof z.ZodString) return prepText;
  if (t instanceof z.ZodNumber) return prepNum;
  if (t instanceof z.ZodBoolean) return prepBool;
  if (t instanceof z.ZodStringFormat) return prepText;
  if (t instanceof z.ZodNumberFormat) return prepNum;
  if (t instanceof z.ZodArray) return prepArray;
  return null;
}

function withPrepFunc<T extends ZType>(t: T) {
  const func = prepFunc(t);
  return func ? z.preprocess(func, t) : t;
}

export function zFormObject<T extends ZodRawShape>(id: string, shape: T) {
  // biome-ignore lint/suspicious/noExplicitAny: strictt type checking not needed here
  const result: Record<string, any> = {};

  for (const [k, v] of Object.entries(shape)) {
    result[k] = withPrepFunc(v);
  }
  return z.strictObject(result as T).meta({ id });
}

export type Maybe<T> = T | null | undefined;

export function jsonResponse<T>(text: unknown, shape: ZodType<T>) {
  if (!text) return undefined as T;

  const json = typeof text === "string" ? JSON.parse(text) : text;

  const valid = shape.safeParse(json);
  if (valid.data) return valid.data;

  // console.error(valid.error);
  return json as T;
}

export function assoc<T, K extends string | number, V>(
  list: T[],
  getKey: (t: T) => K,
  getValue: (t: T) => V,
  keepFirst: boolean = false,
) {
  const record = {} as { [key in K]?: V };
  for (const i of list) {
    const key = getKey(i);
    if (keepFirst && key in record) continue;
    else record[key] = getValue(i);
  }
  return record;
}

export type Falsey<T> = T | null | undefined | "" | false;

export function filterNotNull<T>(list: Maybe<T>[]) {
  return list.filter((t) => t !== null && t !== undefined) as T[];
}

export function filterTruthy<T>(list: Falsey<T>[]) {
  return list.filter((t) => t) as T[];
}

export function enumWithPrefix<E extends string, P extends string>(
  enumType: Record<string, E>,
  prefix: P,
) {
  const values = Object.values(enumType);
  const filtered = values.filter((e) => e.startsWith(prefix));
  return filtered as readonly (E & `${P}${string}`)[];
}
