import type { ZodRawShape, ZodType } from "zod";
import z from "zod";

export type { ZodType } from "zod";

export function zArray<T>(zt: ZodType<T>) {
  return z.array(zt);
}

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

export function jsonResponse<T>(res: unknown, shape: ZodType<T>) {
  const json = typeof res === "string" ? JSON.parse(res) : res;
  return shape.safeParse(json).data ?? (res as T);
}
