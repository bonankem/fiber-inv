import { idNameP } from "schema/common";
import { WorkDocType } from "schema/enums";
import type { LinearRingT } from "schema/geo";
import type { UpPlaqueKmzT } from "schema/uploads";
import { prisma } from "#/db";
import { getBoundingBox, isInsideRing, ringCentre } from "#/geo/utils";
import { to5dp } from "#/utils/queries";
import { maybeUnzip, type ParserInput } from "./utils";

const folderRe = /<folder> ?<name>[^>]*cluster.*?<\/folder>/i;
const linearRingRe = /<linearring.+?<\/linearring>/i;
const lineStringRe = /<linestring.+?<\/linestring>/i;
const coordsRe = /<coordinates.*?<\/coordinates>/i;
const lngLatRe = /(?<!,\d)(-?\d+\.?\d*),(-?\d+\.?\d*)/g;
const placeNameRe = /<placemark>.*?<name>([^<]+)/i;

export async function parseUpAreaKmz({
  data,
}: ParserInput): Promise<UpPlaqueKmzT | null> {
  const input = await maybeUnzip(data);
  if (!input) return null;

  const xml = input.replace(/\s+/gs, " ");
  const cluster = xml.match(folderRe)?.[0] || xml;

  // get the name, making sure it is an actual place name,
  // not something generic like "plaque" or the name of the file
  let name = cluster.match(placeNameRe)?.[1];
  const notRealName = /plaque|boundary|polygon|limit|km[lz]/i;
  if (name && notRealName.test(name)) name = undefined;

  const ring = cluster.match(linearRingRe) || cluster.match(lineStringRe);
  const ringCoords = ring?.[0].match(coordsRe);
  if (!ringCoords) return null;

  const strings = ringCoords[0].matchAll(lngLatRe);
  const boundary: LinearRingT = Array.from(strings, (r) => {
    return { lng: to5dp(r[1]), lat: to5dp(r[2]) };
  });

  const coords = ringCentre(boundary);
  const bbox = getBoundingBox(boundary);

  const boundaries = await prisma.boundary.findMany({
    where: {
      locality: { isNot: null },
      north: { gte: coords.lat },
      south: { lte: coords.lat },
      east: { gte: coords.lng },
      west: { lte: coords.lng },
    },
    include: { locality: idNameP },
  });
  const match = boundaries.find((b) => isInsideRing(coords, b.ring));

  return {
    type: WorkDocType.FHS_AREA_KMZ,
    name,
    bbox,
    coords,
    boundary,
    localityId: match?.locality?.id,
  };
}
