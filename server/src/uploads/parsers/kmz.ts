/** biome-ignore-all lint/suspicious/noExplicitAny: any is needed for the input types */
import { XMLParser } from "fast-xml-parser";
import type { CoordsT } from "schema/geo";
import { filterTruthy, to5dp } from "#/utils/queries";
import { maybeUnzip } from "./utils";

export type KmzPlacemark = {
  name: string;
  geom: CoordsT[];
  oldName?: string;
};

type MaybePlacemark = {
  name: string | null;
  geom: CoordsT[];
  path?: string[];
  oldName?: string;
};

type Folder = {
  name: string | null;
  subfolders: Folder[];
  placemarks: MaybePlacemark[];
};

const parser = new XMLParser();
function toArray<T>(value: any, mapper: (v: any) => T | null) {
  const array = Array.isArray(value) ? value : [value];
  return filterTruthy(array.map(mapper));
}

export async function parseSimpleKmz(data: Buffer) {
  const text = await maybeUnzip(data);
  if (!text) return null;

  const xml = parser.parse(text);
  const folders = stripRootFolders(toArray(xml.kml?.Document, parseFolder));
  return folders.flatMap((f) => flattenFolder(f, []));
}

function matchAnyRe(regexps: RegExp[], strings?: string[]) {
  if (!strings) return false;
  if (regexps.length === 0) return true;
  return regexps.some((re) => strings.some((s) => re.test(s)));
}

function matchAllRe(regexps: RegExp[], strings?: string[]) {
  if (!strings) return false;
  return regexps.every((re) => strings.some((s) => re.test(s)));
}

export function filterPlacemarks(
  ps: MaybePlacemark[],
  point: boolean,
  folder: RegExp[],
  notFolder?: RegExp[],
): KmzPlacemark[] {
  ps = ps.filter(point ? (p) => p.geom.length === 1 : (p) => p.geom.length > 1);
  if (folder.length) ps = ps.filter((p) => matchAllRe(folder, p.path));
  if (notFolder?.length) ps = ps.filter((p) => !matchAnyRe(notFolder, p.path));
  return ps.map((p) => ({ name: p.name ?? "", geom: p.geom }));
}

/**
 * The meaningful parts of the KMZ tree are nested within a root folder, sometimes two,
 * which don't need to be preserved after parsing, so this function strips them.
 */
function stripRootFolders(fs: Folder[]) {
  if (fs.length !== 1) return fs;

  const f1 = fs[0];
  if (f1.placemarks.length > 0) return fs;
  if (f1.subfolders.length !== 1) return f1.subfolders;

  const f2 = f1.subfolders[0];
  if (f2.placemarks.length === 0 && f1.name === `${f2.name}.kmz`) {
    // sometimes, you have two root folders, an outer one 'ABC.kmz' and an inner one 'ABC'
    // in this case strip both and return just the subfolders of the inner folder
    return f2.subfolders;
  }

  // in any other case, just strip the outermost folder
  return f1.subfolders;
}

function parseFolder(value: any): Folder | null {
  if (!value || typeof value !== "object") return null;
  const name: string = value.name || "";
  const placemarks = toArray(value.Placemark, parsePlacemark);
  const subfolders = [
    ...toArray(value.Folder, parseFolder),
    ...toArray(value.Document, parseFolder),
  ];
  return { name, subfolders, placemarks };
}

function parsePlacemark(value: any): MaybePlacemark | null {
  if (!value || typeof value !== "object") return null;

  const name: string = value.name || "";

  const point = value.Point?.coordinates;
  const line = value.LineString?.coordinates;
  const ring = value.Polygon?.outerBoundaryIs?.LinearRing?.coordinates;
  const str = ring || line || point;
  if (typeof str !== "string") return null;

  const re = /(-?\d+\.\d*),(-?\d+\.\d*)(,-?\d+\.\d*)?/g;
  const geom = Array.from(str.matchAll(re), (p) => ({
    lat: to5dp(p[2]),
    lng: to5dp(p[1]),
  }));
  if (!geom.length) return null;

  return { name, geom, path: [] };
}

function flattenFolder(f: Folder, path: string[]): MaybePlacemark[] {
  path = f.name ? [...path, f.name] : path;
  return [
    ...f.placemarks.map((p) => ({ ...p, path })),
    ...f.subfolders.flatMap((f) => flattenFolder(f, path)),
  ];
}
