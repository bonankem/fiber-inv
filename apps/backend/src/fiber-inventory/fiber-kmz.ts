/** biome-ignore-all lint/suspicious/noExplicitAny: parsed XML is untyped */
import { text as streamText } from "node:stream/consumers";
import { XMLParser } from "fast-xml-parser";
import { cleanDescription, type RawKmzFeature } from "schema/fiber-inventory";
import { fromBuffer } from "yauzl-promise";
import { isZip } from "#/uploads/parsers/utils";
import { to5dp } from "#/utils/queries";

/** The KML inside a KMZ: CAD exports may store symbol images before it */
async function readKml(data: Buffer) {
  if (!isZip(data)) return data.toString("utf-8");
  const zip = await fromBuffer(data);
  try {
    for (let e = await zip.readEntry(); e; e = await zip.readEntry()) {
      if (/\.kml$/i.test(e.filename)) {
        return await streamText(await zip.openReadStream(e));
      }
    }
    return null;
  } finally {
    await zip.close();
  }
}

// attributes are needed for ExtendedData names; keep every value a string so
// names like "1" or "007" survive as written
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: false,
  isArray: (name) =>
    [
      "Document",
      "Folder",
      "Placemark",
      "Data",
      "SchemaData",
      "SimpleData",
      "Point",
      "LineString",
      "Polygon",
    ].includes(name),
});

function text(v: any): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v).trim();
  if (typeof v === "object" && "#text" in v) return text(v["#text"]);
  return "";
}

const list = (v: any): any[] => (Array.isArray(v) ? v : v ? [v] : []);

const COORD_RE = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,-?\d+(?:\.\d+)?)?/g;

function coords(s: any) {
  return Array.from(text(s).matchAll(COORD_RE), (m) => ({
    lat: to5dp(m[2]),
    lng: to5dp(m[1]),
  }));
}

function geometries(pm: any) {
  const multi = list(pm.MultiGeometry);
  const holders = [pm, ...multi];
  const out: Pick<RawKmzFeature, "kind" | "geom">[] = [];
  for (const h of holders) {
    for (const p of list(h.Polygon)) {
      const geom = coords(p.outerBoundaryIs?.LinearRing?.coordinates);
      if (geom.length > 2) out.push({ kind: "polygon", geom });
    }
    for (const l of list(h.LineString)) {
      const geom = coords(l.coordinates);
      if (geom.length < 2) continue;
      const [a, b] = [geom[0], geom[geom.length - 1]];
      const closed = geom.length > 3 && a.lat === b.lat && a.lng === b.lng;
      out.push({ kind: closed ? "polygon" : "line", geom });
    }
    for (const p of list(h.Point)) {
      const geom = coords(p.coordinates);
      if (geom.length) out.push({ kind: "point", geom: [geom[0]] });
    }
  }
  return out;
}

function dataPairs(pm: any): [string, string][] {
  const ext = pm.ExtendedData;
  if (!ext) return [];
  const pairs: [string, string][] = [];
  for (const d of list(ext.Data)) {
    pairs.push([text(d.displayName) || text(d["@_name"]), text(d.value)]);
  }
  for (const sd of list(ext.SchemaData)) {
    for (const s of list(sd.SimpleData))
      pairs.push([text(s["@_name"]), text(s)]);
  }
  return pairs.filter(([k, v]) => k && v);
}

function walk(node: any, path: string[], out: RawKmzFeature[]) {
  for (const pm of list(node.Placemark)) {
    const base = {
      name: text(pm.name),
      path,
      description: cleanDescription(text(pm.description)),
      data: dataPairs(pm),
    };
    for (const g of geometries(pm)) out.push({ ...base, ...g });
  }
  for (const child of [...list(node.Document), ...list(node.Folder)]) {
    const name = text(child.name);
    walk(child, name ? [...path, name] : path, out);
  }
}

/** Every placemark of a KMZ/KML, with its folder path and attributes */
export async function parseFiberKmz(data: Buffer): Promise<RawKmzFeature[]> {
  const kml = await readKml(data);
  if (!kml) return [];
  const xml = parser.parse(kml);
  const out: RawKmzFeature[] = [];
  if (xml.kml) walk(xml.kml, [], out);
  return out;
}
