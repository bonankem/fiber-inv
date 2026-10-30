/**
 * Shared site-list parser, used by both the upload preview (web) and the
 * upload API (backend) so that a file accepted by the preview is never
 * rejected on save.
 */

export type FiberSiteRowT = {
  code: string;
  siteName: string;
  locality: string;
  lat: number;
  lng: number;
};

const CODE_HEADERS = ["codesite", "sitecode", "code", "siteid", "id"];
const NAME_HEADERS = ["sitename", "name", "nomsite", "nomdusite", "site"];
const LOCALITY_HEADERS = [
  "localite",
  "locality",
  "localisation",
  "city",
  "ville",
  "commune",
  "zone",
  "region",
];
const LAT_HEADERS = ["lat", "latitude", "coordlat", "y"];
const LNG_HEADERS = [
  "long",
  "longitude",
  "lng",
  "lon",
  "coordlong",
  "coordlng",
  "x",
];

export const FIBER_SITE_REQUIRED_HEADERS =
  "Code, Site Name, Latitude, Longitude";

/**
 * Normalizes header string by stripping accents, symbols, and whitespace.
 */
export function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Parses numeric coordinate values, supporting comma decimal separators (e.g., "5,3412").
 */
export function parseCoordinate(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (value === null || value === undefined) return null;
  const str = String(value).trim().replace(",", ".");
  if (!str) return null;
  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

const round5 = (n: number) => Math.round(n * 100000) / 100000;

function parseSheetRows(rows: unknown[][]): FiberSiteRowT[] {
  const headerIndex = rows.findIndex((row) => {
    if (!Array.isArray(row)) return false;
    const headers = row.map((v) => normalizeHeader(String(v ?? "")));
    return (
      headers.some((h) => CODE_HEADERS.includes(h)) &&
      headers.some((h) => NAME_HEADERS.includes(h))
    );
  });
  if (headerIndex < 0) return [];

  const headers = rows[headerIndex].map((v) =>
    normalizeHeader(String(v ?? "")),
  );
  // first matching candidate wins, so "sitecode" beats a generic "id" column
  const column = (candidates: string[]) => {
    for (const c of candidates) {
      const i = headers.indexOf(c);
      if (i >= 0) return i;
    }
    return -1;
  };
  const codeCol = column(CODE_HEADERS);
  const nameCol = column(NAME_HEADERS);
  const localityCol = column(LOCALITY_HEADERS);
  const latCol = column(LAT_HEADERS);
  const lngCol = column(LNG_HEADERS);
  if (latCol < 0 || lngCol < 0) return [];

  return rows.slice(headerIndex + 1).flatMap((row) => {
    if (!Array.isArray(row)) return [];
    const code = String(row[codeCol] ?? "").trim();
    const siteName = String(row[nameCol] ?? "").trim();
    const locality =
      (localityCol >= 0 ? String(row[localityCol] ?? "").trim() : "") || "N/A";
    const lat = parseCoordinate(row[latCol]);
    const lng = parseCoordinate(row[lngCol]);
    if (!code || !siteName || lat === null || lng === null) return [];
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return [];
    if (lat === 0 && lng === 0) return [];
    return [{ code, siteName, locality, lat: round5(lat), lng: round5(lng) }];
  });
}

/**
 * Extracts sites from every sheet (rows as returned by `sheet_to_json` with
 * `header: 1`), deduplicated by site code, keeping the last occurrence.
 */
export function parseFiberSiteSheets(sheets: unknown[][][]): FiberSiteRowT[] {
  const unique = new Map<string, FiberSiteRowT>();
  for (const rows of sheets) {
    for (const site of parseSheetRows(rows)) unique.set(site.code, site);
  }
  return Array.from(unique.values());
}
