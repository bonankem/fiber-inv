import { utils, type WorkBook } from "@e965/xlsx";
import { bad, Err } from "schema/errors";

type TableField<K> = {
  name: K;
  label?: string;
  regexp: RegExp;
  optional?: boolean;
};

export function tableFields<K extends string>(fields: TableField<K>[]) {
  return fields;
}

type SheetFallback = "first" | "error" | "none";

export function findSheetIndex(
  book: WorkBook,
  name: string,
  regexp: RegExp,
  fallback: SheetFallback = "error",
): number {
  const exact = book.SheetNames.indexOf(name);
  if (exact >= 0) return exact;

  const match = book.SheetNames.findIndex((s) => regexp.test(s));
  if (match >= 0) return match;

  if (fallback === "first") return 0;
  if (fallback === "none") return -1;
  bad(Err.MISSING_SHEET, name);
}

export function parseTable<K extends string>(
  book: WorkBook,
  sheetN: number,
  fields: TableField<K>[],
) {
  const sheetName = book.SheetNames[sheetN];
  const sheet = book.Sheets[sheetName];
  const array = utils.sheet_to_json<Record<string, unknown>>(sheet, {
    header: "A",
    blankrows: false,
    skipHidden: true,
  });

  const hIndex = array.findIndex((row) => Object.keys(row).length > 1);
  if (hIndex < 0) bad(Err.INVALID_FILE);

  const header = array[hIndex];
  const headerCols = Object.keys(header);
  const fieldToCol = {} as Record<K, string>;

  for (const field of fields) {
    const col = headerCols.find((h) => {
      const value = header[h];
      if (typeof value !== "string") return;
      return field.regexp.test(value);
    });
    const fieldLabel = field.label || field.name;
    if (col) {
      fieldToCol[field.name] = col;
    } else if (!field.optional) {
      bad(Err.INVALID_FILE, `No ${fieldLabel} column in ${sheetName} sheet`);
    }
  }

  const fieldCols = Object.entries(fieldToCol) as [K, string][];
  const rows = array.slice(hIndex + 1);
  const result = rows.map((row) => {
    const item = {} as Record<K, unknown>;
    for (const [field, col] of fieldCols) {
      item[field] = row[col];
    }
    return item;
  });

  return result;
}
