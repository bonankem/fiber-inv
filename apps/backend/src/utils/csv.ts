import type { Maybe } from "schema/utils";
import type { AnyReply } from "#/utils/routing";

export type CsvFunc<T> = (t: T) => Maybe<string | number | Date>;

export type CsvCol<T> = {
  title: string;
  value: CsvFunc<T>;
};

type CsvColsInput<T> = CsvCol<T>[] | Record<string, CsvFunc<T>>;

function csvCols<T>(cols: CsvColsInput<T>) {
  if (Array.isArray(cols)) return cols;
  return Object.entries(cols).map(([title, value]) => ({ title, value }));
}

function csvValue(s: Maybe<string | number | Date>) {
  if (!s) return "";
  if (typeof s === "number") {
    return s.toString();
  }
  if (s instanceof Date) {
    return s.toISOString().substring(0, 19).replace("T", " ");
  }
  s = s.replace(/"/g, "").replace(/\n/g, " ");
  return s.includes(",") ? `"${s}"` : s;
}

export function makeCsv<T>(data: T[], cols: CsvColsInput<T>) {
  const cs = csvCols(cols);
  const head = cs.map((c) => csvValue(c.title)).join(",");
  const body = data.map((d) => cs.map((c) => csvValue(c.value(d))).join(","));
  return `${head}\n${body.join("\n")}`;
}

export function sendCsv<T>(reply: AnyReply, data: T[], cols: CsvColsInput<T>) {
  const csv = makeCsv(data, cols);
  return reply.type("text/csv").send(csv);
}
