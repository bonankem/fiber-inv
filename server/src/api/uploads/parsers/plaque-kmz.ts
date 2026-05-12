import { WorkDocType } from "schema/enums";
import type { LinearRingT } from "schema/geo";
import type { UpPlaqueKmzT } from "schema/uploads";
import { visualCentreOfPolygon } from "#/geo/utils";
import { maybeUnzip, type ParserInput } from "./utils";

const folderRe = /<folder> ?<name>[^>]*cluster.*?<\/folder>/i;
const linearRingRe = /<linearring.+?<\/linearring>/i;
const lineStringRe = /<linestring.+?<\/linestring>/i;
const coordsRe = /<coordinates.*?<\/coordinates>/i;
const lngLatRe = /(?<!,\d)(-?\d+\.?\d*),(-?\d+\.?\d*)/g;

export async function parsePlaqueKmz({
  data,
}: ParserInput): Promise<UpPlaqueKmzT | null> {
  const raw = await maybeUnzip(data);
  if (!raw) return null;

  const xml = raw.replace(/\s+/gs, " ");
  const cluster = xml.match(folderRe)?.[0] || xml;

  const ring = cluster.match(linearRingRe) || cluster.match(lineStringRe);
  if (!ring) return null;

  const coords = ring[0].match(coordsRe);
  if (!coords) return null;

  const strings = coords[0].matchAll(lngLatRe);
  const boundary: LinearRingT = Array.from(strings, (r) => {
    return { lng: Number(r[1]), lat: Number(r[2]) };
  });

  return {
    type: WorkDocType.PLAQUE_KMZ,
    coords: visualCentreOfPolygon([boundary]),
    boundary,
  };
}
