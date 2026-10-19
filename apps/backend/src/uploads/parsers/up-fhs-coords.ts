import { read } from "@e965/xlsx";
import type { UpFhsCoordsT } from "schema/uploads";
import { BoxType, WorkDocType } from "#/db";
import { filterTruthy, maybeCoords } from "#/utils/queries";
import { parseTable, tableFields } from "./excel";
import type { ParserInput } from "./utils";

const coordsFields = tableFields([
  { name: "name", label: "Boitiers", regexp: /box|boitier/i },
  { name: "lat", label: "Latitude", regexp: /latitude/i },
  { name: "lng", label: "Longitude", regexp: /longitude/i },
  { name: "hp", label: "HP", regexp: /hp/i },
]);

function boxType(name: string) {
  const re = /^(.+-X\d+)(?:(-H\d+)(-([SE])\d+)?)?/.exec(name);
  if (!re) return null;
  if (!re[2]) return BoxType.X;
  if (!re[3]) return BoxType.HUB;
  return BoxType.FAT;
}

export async function parseUpFhsCoords({
  data,
}: ParserInput): Promise<UpFhsCoordsT | null> {
  const book = read(data, { dense: true, sheetRows: 5000 });
  const rows = parseTable(book, 0, coordsFields);

  const items = rows.map((r) => {
    const n = r.name;
    const name = typeof n === "string" ? n.toUpperCase().trim() : null;
    if (!name) return undefined;

    const type = boxType(name);
    if (!type) return undefined;

    const h = Number(r.hp);
    const hp = Number.isFinite(h) && h >= 0 ? h : null;
    const coords = maybeCoords(r.lat, r.lng);
    return { name, type, coords, hp };
  });

  return {
    type: WorkDocType.FHS_COORDINATES,
    boxes: filterTruthy(items),
  };
}
