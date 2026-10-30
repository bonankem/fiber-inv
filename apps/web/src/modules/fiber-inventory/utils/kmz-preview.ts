import JSZip from "jszip";
import type { FiberInventoryItemT } from "schema/fiber-inventory";
import type { KmzPreviewData } from "./types";

export type { KmzPreviewData };

export async function parseKmzForPreview(file: File): Promise<KmzPreviewData> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  let kmlText = "";

  if (extension === "kmz") {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Find the first .kml file in the archive (usually doc.kml)
    const kmlFileName = Object.keys(zip.files).find((name) =>
      name.toLowerCase().endsWith(".kml"),
    );

    if (!kmlFileName) {
      throw new Error("No .kml file found inside the KMZ archive");
    }

    const kmlFile = zip.files[kmlFileName];
    kmlText = await kmlFile.async("string");
  } else if (extension === "kml") {
    kmlText = await file.text();
  } else {
    throw new Error("Unsupported file format. Please upload .kmz or .kml");
  }

  const items = parseKmlString(kmlText);

  const summary = {
    polygons: items.filter((i) => i.kind === "polygon").length,
    lines: items.filter((i) => i.kind === "line").length,
    points: items.filter((i) => i.kind === "point").length,
  };

  return {
    fileName: file.name,
    fileSize: file.size,
    items,
    summary,
  };
}

function parseKmlString(xmlString: string): FiberInventoryItemT[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");

  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Failed to parse KML content: Invalid XML format");
  }

  const placemarks = Array.from(doc.querySelectorAll("Placemark"));
  const items: FiberInventoryItemT[] = [];

  for (const pm of placemarks) {
    const name =
      pm.querySelector("name")?.textContent?.trim() || "Unnamed feature";

    // Check for Polygon
    const polygon = pm.querySelector("Polygon");
    if (polygon) {
      const coordsText =
        polygon.querySelector("outerBoundaryIs LinearRing coordinates")
          ?.textContent ||
        polygon.querySelector("LinearRing coordinates")?.textContent ||
        polygon.querySelector("coordinates")?.textContent;
      if (coordsText) {
        const geom = parseCoordinatesString(coordsText);
        if (geom.length > 2) {
          items.push({
            name,
            kind: "polygon",
            geom,
            sites: [],
          });
          continue;
        }
      }
    }

    // Check for LineString
    const lineString = pm.querySelector("LineString");
    if (lineString) {
      const coordsText = lineString.querySelector("coordinates")?.textContent;
      if (coordsText) {
        const geom = parseCoordinatesString(coordsText);
        if (geom.length > 1) {
          // Check if it's actually closed
          const first = geom[0];
          const last = geom[geom.length - 1];
          const isClosed =
            geom.length > 3 && first.lat === last.lat && first.lng === last.lng;

          items.push({
            name,
            kind: isClosed ? "polygon" : "line",
            geom,
            sites: [],
          });
          continue;
        }
      }
    }

    // Check for Point
    const point = pm.querySelector("Point");
    if (point) {
      const coordsText = point.querySelector("coordinates")?.textContent;
      if (coordsText) {
        const geom = parseCoordinatesString(coordsText);
        if (geom.length >= 1) {
          items.push({
            name,
            kind: "point",
            geom: [geom[0]],
            sites: [],
          });
        }
      }
    }
  }

  return items;
}

function parseCoordinatesString(
  coordsText: string,
): { lat: number; lng: number }[] {
  const trimmed = coordsText.trim();
  const regex = /(-?\d+\.?\d*),(-?\d+\.?\d*)(?:,-?\d+\.?\d*)?/g;
  const points: { lat: number; lng: number }[] = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(trimmed)) !== null) {
    const lng = Number.parseFloat(match[1]);
    const lat = Number.parseFloat(match[2]);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      points.push({ lat: to5dp(lat), lng: to5dp(lng) });
    }
  }

  return points;
}

function to5dp(num: number): number {
  return Math.round(num * 100000) / 100000;
}
