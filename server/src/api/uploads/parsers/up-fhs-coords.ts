import type { UpFhsCoordsT } from "schema/uploads";
import { read, utils } from "xlsx";
import { filterTruthy, maybeCoords } from "#/api/utils/queries";
import { BoxType, WorkDocType } from "#/prisma";
import type { ParserInput } from "./utils";

function boxType(name: string) {
  const re = /^(.+_X\d+)(?:(_H\d+)(_([SE])\d+)?)?/.exec(name);
  if (!re) return null;
  if (!re[2]) return BoxType.X_BOX;
  if (!re[3]) return BoxType.HUB_BOX;
  return re[4] === "S" ? BoxType.SUB_BOX : BoxType.END_BOX;
}

export async function parseUpFhsCoords({
  data,
}: ParserInput): Promise<UpFhsCoordsT | null> {
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
  const nameKey = findKey(/boitier/i);
  const latKey = findKey(/latitude/i);
  const lonKey = findKey(/longitude/i);
  const hpKey = findKey(/hp/i);

  const items = rows.map((r) => {
    const n = r[nameKey];
    const name = typeof n === "string" ? n.toUpperCase().trim() : null;
    if (!name) return undefined;

    const type = boxType(name);
    if (!type) return undefined;

    const h = Number(r[hpKey]);
    const hp = Number.isFinite(h) && h >= 0 ? h : null;
    const coords = maybeCoords(r[latKey], r[lonKey]);
    return { name, type, coords, hp };
  });

  return {
    type: WorkDocType.COORDINATES,
    boxes: filterTruthy(items),
  };
}
