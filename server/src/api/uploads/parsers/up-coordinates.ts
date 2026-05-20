import type { UpCoordinatesT } from "schema/uploads";
import { read, utils } from "xlsx";
import { filterTruthy, maybeCoords } from "#/api/utils/queries";
import { WorkDocType } from "#/prisma";
import type { ParserInput } from "./utils";

export async function parseUpCoordinates({
  data,
}: ParserInput): Promise<UpCoordinatesT | null> {
  const book = read(data, { dense: true, sheetRows: 5000 });
  const sheet = book.Sheets[book.SheetNames[0]];
  const array = utils.sheet_to_json<Record<string, unknown>>(sheet, {
    header: "A",
    blankrows: false,
    skipHidden: true,
  });

  const [heads, ...rows] = array;
  const keys = Object.keys(array[0]);
  const headers = {} as Record<string, string>;
  for (const key of keys) {
    headers[key] = heads[key]?.toString() ?? "";
  }
  function findKey(...res: RegExp[]) {
    for (const re of res) {
      for (const key of keys) {
        if (re.test(headers[key])) {
          return key;
        }
      }
    }
    return "";
  }
  const nameKey = findKey(/boitier/i, /label/i);
  const latKey = findKey(/latitude/i);
  const lonKey = findKey(/longitude/i);
  const items = rows.map((r) => {
    const name = r[nameKey];
    if (!name || typeof name !== "string") return undefined;
    return { name, coords: maybeCoords(r[latKey], r[lonKey]) };
  });

  return {
    type: WorkDocType.COORDINATES,
    madeAt: book.Props?.CreatedDate || null,
    items: filterTruthy(items),
  };
}
