import { indexBy, pipe, sortBy } from "remeda";
import type { CoordsT } from "schema/geo";
import type { UpPlanKmzT } from "schema/uploads";
import { filterTruthy } from "schema/utils";
import { BoxType, WorkDocType } from "#/db";
import type { Maybe } from "#/utils";
import { filterPlacemarks, type KmzPlacemark, parseSimpleKmz } from "./kmz";
import type { ParserInput } from "./utils";

export async function parseUpPlanKmz({
  data,
}: ParserInput): Promise<UpPlanKmzT | null> {
  const kmz = await parseSimpleKmz(data);
  if (!kmz) return null;

  const metalPoles = filterPlacemarks(
    kmz,
    true,
    [/poteau|pole/i, /metal|steel|^s[- ]*\d/iu],
    [/exist/i],
  );

  const concretePoles = filterPlacemarks(
    kmz,
    true,
    [/poteau|pole/i, /b[eé]ton|concrete|^c[- ]*\d/iu],
    [/exist/i],
  );

  const boxes = filterPlacemarks(kmz, true, [/boitiers|boxes/i], [/exist/i]);
  const cables = filterPlacemarks(kmz, false, [/c[âa]ble/i], [/exist/i]);

  // TODO: match FATs to boundaries
  // const bounds = filterPlacemarks(
  //   kmz,
  //   false,
  //   [/zones?.?influence|fat.?bound/i],
  //   [/exist/i],
  // );

  // there is a possibility that, in the KMZ, the boxes are labelled with
  // the cable names instead of the actual box names; the code below
  // attempts to detect and correct this by deducing the proper box names
  // and also assigning the proper cable names to the cables if needed

  const dicRe = /^(\w+)\/X\d+\/H\d+(\/S\d+(\/[SE]\d+)?)?\/\d+$/;
  const trcRe = /^(\w+)\/T\d+\/TR\/\d+\/\d+$/;
  const boxRe = /^(\w+)-X\d+(-H\d+(-[SE]\d+)?)?$/;

  const boxesAndCables = [...boxes, ...cables];
  const boxNames = new Set<string>();
  const cableNames = new Set<string>();

  for (const { name } of boxesAndCables) {
    if (boxRe.test(name)) boxNames.add(name);
    else if (dicRe.test(name)) cableNames.add(name);
    else if (trcRe.test(name)) cableNames.add(name);
  }

  const anyCable = cableNames.values().next().value;
  const thisYear = (new Date().getFullYear() % 100).toString().padStart(2, "0");
  const year = anyCable?.split("/").pop() || thisYear;

  for (const box of boxes) {
    if (boxRe.test(box.name)) continue;
    const match = dicRe.exec(box.name);
    if (!match) continue;

    const name = box.name
      .replace(/\//g, "-")
      .replace(/-\d+$/, "")
      .replace(/-S\d+-/, "-")
      .replace(/(?<=[XHSE])(?=\d\b)/g, "0");
    box.oldName = box.name;
    box.name = name;
  }

  boxes.sort(nameSort);

  for (const cable of cables) {
    if (cableNames.has(cable.name)) continue;

    const ps = cable.geom;
    const p1 = ps[0];
    const p2 = ps[ps.length - 1];

    const b1 = getNearestBox(p1, boxes);
    const b2 = getNearestBox(p2, boxes);
    if (renameCable(cable, b1, b2, year)) continue;
  }

  cables.sort(nameSort);

  const allPoles = [...metalPoles, ...concretePoles];
  const poleIds = new Set(allPoles.map((p) => getPoleId(p.geom[0])));
  const poleToBox = indexBy(boxes, (b) => getPoleId(b.geom[0]));

  type PoleToCable = { cable: KmzPlacemark; count: number };
  const poleToCable: Record<string, PoleToCable> = {};

  // it is likely that the longer cables will be further in the list,
  // so reversing the list puts shorter cables at the end,
  cables.forEach((cable) => {
    const entry = { cable, count: 0 };

    // add the halfway points of each span for better accuracy
    const geom = cable.geom.flatMap((p1, i, ps) => {
      if (i === 0) return p1;
      const p0 = ps[i - 1];
      const half = {
        lat: (p1.lat + p0.lat) / 2,
        lng: (p1.lng + p0.lng) / 2,
      };
      return [half, p1];
    });
    for (const p of geom) {
      const id = getPoleId(p);
      if (poleIds.has(id) && !poleToCable[id]) {
        poleToCable[id] = entry;
      }
    }
  });

  for (const p of allPoles) {
    const id = getPoleId(p.geom[0]);
    const box = poleToBox[id];
    if (box) {
      p.oldName = p.name;
      p.name = `${box.name}-P`;
      continue;
    }
    const entry = poleToCable[id];
    if (entry) {
      p.oldName = p.name;
      const name = entry.cable.name.replace(/\/\d+$/, "");
      p.name = `${name}-P${++entry.count}`;
    }
  }
  metalPoles.sort(nameSort);
  concretePoles.sort(nameSort);

  return {
    type: WorkDocType.PLAN_KMZ,
    boxes: boxes.map((b) => ({
      name: b.name,
      type: getBoxType(b),
      coords: b.geom[0],
    })),
    cables,
    metalPoles,
    concretePoles,
  };
}

function getBoxType(b: KmzPlacemark) {
  if (/-E\d+$/.test(b.name)) return BoxType.END_BOX;
  if (/-S\d+$/.test(b.name)) return BoxType.SUB_BOX;
  if (/-H\d+$/.test(b.name)) return BoxType.HUB_BOX;
  if (/-X\d+$/.test(b.name)) return BoxType.X_BOX;
  return BoxType.END_BOX;
}

function getPoleId(c: CoordsT) {
  // a factor of 1/20000 gives a margin of error of 5m
  const factor = 10000;
  const lat = Math.round(c.lat * factor);
  const lng = Math.round(c.lng * factor);
  return `${lat}${lng}`;
}

function nameSort(a: { name: string }, b: { name: string }) {
  const n1 = a.name.replace(/\bE(?=\d)/, "Z").toUpperCase();
  const n2 = b.name.replace(/\bE(?=\d)/, "Z").toUpperCase();
  return n1.localeCompare(n2);
}

function getNearestBox(c: CoordsT, boxes: KmzPlacemark[]) {
  const ns = pipe(
    boxes.map((box) => {
      const b = box.geom[0];
      const dlat = Math.abs(b.lat - c.lat);
      const dlng = Math.abs(b.lng - c.lng);
      if (dlat > 0.0001 || dlng > 0.0001) return null;
      return { box, dist: dlat + dlng };
    }),
    filterTruthy,
    sortBy((b) => b.dist),
  );
  const n = ns.length;
  if (n === 0) return undefined;

  // if multiple boxes are equally near, we can't pick one
  if (n > 1 && ns[0].dist === ns[1].dist) return undefined;

  return ns[0].box;
}

function renameCable(
  c: KmzPlacemark,
  b1: Maybe<KmzPlacemark>,
  b2: Maybe<KmzPlacemark>,
  year: string,
) {
  if (!b1 || !b2) return false;
  let n1 = b1.name || "";
  let n2 = b2.name || "";

  const isEnd1 = /E\d+$/.test(n1);
  const isEnd2 = /E\d+$/.test(n2);
  if (isEnd1 || (!isEnd1 && !isEnd2 && n1 > n2)) {
    const tmp = n1;
    n1 = n2;
    n2 = tmp;
  }
  const a = /^.+-X\d+-H\d+(?:-S\d+)?/.exec(n1);
  const b = /-[SE]\d+/.exec(n2);
  if (!a || !b) return false;

  const name = `${a[0]}${b[0]}/${year}`.replace(/-/g, "/");
  c.oldName = c.name;
  c.name = name;
  return true;
}
