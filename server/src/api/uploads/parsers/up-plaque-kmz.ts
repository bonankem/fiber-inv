import { idNameP } from "schema/common";
import { WorkDocType } from "schema/enums";
import type { LinearRingT } from "schema/geo";
import type { UpPlaqueKmzT } from "schema/uploads";
import {
  getBoundingBox,
  isInsideMp,
  visualCentreOfPolygon,
} from "#/api/geo/utils";
import { prisma } from "#/prisma";
import { maybeUnzip, type ParserInput } from "./utils";

const folderRe = /<folder> ?<name>[^>]*cluster.*?<\/folder>/i;
const linearRingRe = /<linearring.+?<\/linearring>/i;
const lineStringRe = /<linestring.+?<\/linestring>/i;
const coordsRe = /<coordinates.*?<\/coordinates>/i;
const lonLatRe = /(?<!,\d)(-?\d+\.?\d*),(-?\d+\.?\d*)/g;
const placeNameRe = /<placemark>.*?<name>([^<]+)/i;

export async function parseUpPlaqueKmz({
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

  const strings = ringCoords[0].matchAll(lonLatRe);
  const boundary: LinearRingT = Array.from(strings, (r) => {
    return { lon: Number(r[1]), lat: Number(r[2]) };
  });

  const coords = visualCentreOfPolygon([boundary]);
  const bbox = getBoundingBox([[boundary]]);

  const boundaries = await prisma.boundary.findMany({
    where: {
      locality: {},
      north: { gte: coords.lat },
      south: { lte: coords.lat },
      east: { gte: coords.lon },
      west: { lte: coords.lon },
    },
    include: { locality: idNameP },
  });
  const match = boundaries.find((b) => isInsideMp(coords, b.multiPolygon));

  return {
    type: WorkDocType.PLAQUE_KMZ,
    name,
    bbox,
    coords,
    boundary,
    localityId: match?.locality?.id,
  };
}
