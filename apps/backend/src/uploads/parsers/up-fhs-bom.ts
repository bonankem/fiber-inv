import { read, utils } from "@e965/xlsx";
import { fhsBomEquipmentS } from "schema/fhs";
import type { UpFhsBomT } from "schema/uploads";
import { prisma, WorkDocType } from "#/db";
import type { ParserInput } from "./utils";

const CODE_HEADERS = [
  "mtncode",
  "mtnitemcode",
  "itemcode",
  "materialcode",
  "code",
  "codearticle",
  "sku",
];
const QTY_HEADERS = ["quantity", "qty", "qte", "quantite", "qtyrequired"];

function normalize(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// BOQs usually have a title block above the table, so look for the row
// naming both a code and a quantity column rather than the first filled row
function findColumns(rows: unknown[][]) {
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const headers = rows[i].map(normalize);
    const col = (names: string[]) =>
      names.map((n) => headers.indexOf(n)).find((c) => c >= 0) ?? -1;
    const code = col(CODE_HEADERS);
    const qty = col(QTY_HEADERS);
    if (code >= 0 && qty >= 0) return { row: i, code, qty };
  }
  return null;
}

export async function parseUpFhsBom({
  data,
}: ParserInput): Promise<UpFhsBomT | null> {
  const book = read(data, { dense: true, sheetRows: 5000 });

  for (const sheetName of book.SheetNames) {
    const rows = utils.sheet_to_json<unknown[]>(book.Sheets[sheetName], {
      header: 1,
      blankrows: false,
    });
    const cols = findColumns(rows);
    if (!cols) continue;

    // the same item on several lines becomes one BOM line
    const quantities = new Map<string, number>();
    for (const row of rows.slice(cols.row + 1)) {
      const code = String(row[cols.code] ?? "").trim();
      const qty = Math.round(Number(row[cols.qty]));
      if (!code || !Number.isFinite(qty) || qty <= 0) continue;
      quantities.set(code, (quantities.get(code) ?? 0) + qty);
    }
    if (!quantities.size) continue;

    const codes = [...quantities.keys()];
    const found = await prisma.equipment.findMany({
      where: {
        OR: codes.map((c) => ({
          mtnCode: { equals: c, mode: "insensitive" as const },
        })),
      },
      select: fhsBomEquipmentS,
    });
    const byCode = new Map(found.map((e) => [e.mtnCode.toUpperCase(), e]));

    return {
      type: WorkDocType.FHS_BOM,
      lines: codes.map((code) => ({
        code,
        quantity: quantities.get(code) ?? 0,
        equipment: byCode.get(code.toUpperCase()) ?? null,
      })),
    };
  }

  return null;
}
