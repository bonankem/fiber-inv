import JSZip from "jszip";
import {
  assignLayers,
  classifyKmzFeature,
  cleanDescription,
  countLayers,
  type FiberInventoryItemT,
  type RawKmzFeature,
} from "schema/fiber-inventory";
import type { KmzPreviewData } from "./types";

export type { KmzPreviewData };

/**
 * Reads a KMZ/KML in the browser for the upload preview. Mirrors the API's
 * reader (folder paths, descriptions, ExtendedData, MultiGeometry) so layer
 * names match: the layers left out here are sent to the API by name.
 */
export async function parseKmzForPreview(file: File): Promise<KmzPreviewData> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  let kmlText = "";

  if (extension === "kmz") {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    // CAD exports may store symbol images first, so look for the .kml
    const kmlName = Object.keys(zip.files).find((n) =>
      n.toLowerCase().endsWith(".kml"),
    );
    if (!kmlName) throw new Error("No .kml file found inside the KMZ archive");
    kmlText = await zip.files[kmlName].async("string");
  } else if (extension === "kml") {
    kmlText = await file.text();
  } else {
    throw new Error("Unsupported file format. Please upload .kmz or .kml");
  }

  const raw = assignLayers(parseKml(kmlText));
  const items: FiberInventoryItemT[] = raw.map((f) => ({
    name: f.name,
    kind: f.kind,
    geom: f.geom,
    layer: f.layer,
    props: f.props,
    sites: [],
    ...classifyKmzFeature({ name: f.name, kind: f.kind, path: f.path }),
  }));

  return {
    fileName: file.name,
    fileSize: file.size,
    items,
    layers: countLayers(items),
    summary: {
      polygons: items.filter((i) => i.kind === "polygon").length,
      lines: items.filter((i) => i.kind === "line").length,
      points: items.filter((i) => i.kind === "point").length,
      manholes: items.filter((i) => i.category === "manhole").length,
    },
  };
}

const childText = (el: Element, tag: string) =>
  Array.from(el.children)
    .find((c) => c.localName === tag)
    ?.textContent?.trim() ?? "";

/** Names of the Folders/Documents a placemark sits in, outermost first */
function folderPath(pm: Element): string[] {
  const path: string[] = [];
  for (let el = pm.parentElement; el; el = el.parentElement) {
    if (el.localName !== "Folder" && el.localName !== "Document") continue;
    const name = childText(el, "name");
    if (name) path.unshift(name);
  }
  return path;
}

function dataPairs(pm: Element): [string, string][] {
  const ext = Array.from(pm.children).find(
    (c) => c.localName === "ExtendedData",
  );
  if (!ext) return [];
  const pairs: [string, string][] = [];
  for (const d of Array.from(ext.getElementsByTagNameNS("*", "Data"))) {
    const key = childText(d, "displayName") || d.getAttribute("name") || "";
    pairs.push([key.trim(), childText(d, "value")]);
  }
  for (const s of Array.from(ext.getElementsByTagNameNS("*", "SimpleData"))) {
    pairs.push([
      (s.getAttribute("name") ?? "").trim(),
      s.textContent?.trim() ?? "",
    ]);
  }
  return pairs.filter(([k, v]) => k && v);
}

const COORD_RE = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,-?\d+(?:\.\d+)?)?/g;
const to5dp = (n: number) => Math.round(n * 100000) / 100000;

function coords(text: string | null | undefined) {
  return Array.from((text ?? "").matchAll(COORD_RE), (m) => ({
    lat: to5dp(Number(m[2])),
    lng: to5dp(Number(m[1])),
  }));
}

const byTag = (el: Element, tag: string) =>
  Array.from(el.getElementsByTagNameNS("*", tag));

function geometries(pm: Element) {
  const out: Pick<RawKmzFeature, "kind" | "geom">[] = [];
  for (const p of byTag(pm, "Polygon")) {
    const outer = byTag(p, "outerBoundaryIs")[0] ?? p;
    const geom = coords(byTag(outer, "coordinates")[0]?.textContent);
    if (geom.length > 2) out.push({ kind: "polygon", geom });
  }
  for (const l of byTag(pm, "LineString")) {
    const geom = coords(byTag(l, "coordinates")[0]?.textContent);
    if (geom.length < 2) continue;
    const [a, b] = [geom[0], geom[geom.length - 1]];
    const closed = geom.length > 3 && a.lat === b.lat && a.lng === b.lng;
    out.push({ kind: closed ? "polygon" : "line", geom });
  }
  for (const p of byTag(pm, "Point")) {
    const geom = coords(byTag(p, "coordinates")[0]?.textContent);
    if (geom.length) out.push({ kind: "point", geom: [geom[0]] });
  }
  return out;
}

function parseKml(xml: string): RawKmzFeature[] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("Failed to parse KML content: Invalid XML format");
  }

  const out: RawKmzFeature[] = [];
  for (const pm of byTag(doc.documentElement, "Placemark")) {
    const base = {
      name: childText(pm, "name"),
      path: folderPath(pm),
      description: cleanDescription(childText(pm, "description")),
      data: dataPairs(pm),
    };
    for (const g of geometries(pm)) out.push({ ...base, ...g });
  }
  return out;
}
