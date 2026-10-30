import * as XLSX from "@e965/xlsx";
import {
  FIBER_SITE_REQUIRED_HEADERS,
  type FiberInventoryItemT,
  type FiberSiteT,
  matchSitesToFeatures,
  parseFiberSiteSheets,
} from "schema/fiber-inventory";
import type { SpreadsheetPreviewData } from "./types";

/**
 * Matches sites to the containing polygon, or the nearest fiber line / POP
 * within FIBER_MATCH_RADIUS_M, in real-time.
 */
export function matchSitesToItems(
  sites: FiberSiteT[],
  items: FiberInventoryItemT[],
): {
  matchedSites: FiberSiteT[];
  matchedItems: FiberInventoryItemT[];
  matchedCount: number;
  unmatchedCount: number;
} {
  const { sites: matchedSites, siteIndexesByItem } = matchSitesToFeatures(
    sites,
    items,
  );
  const matchedItems = items.map((item, i) => ({
    ...item,
    sites: siteIndexesByItem[i].map((siteIndex) => matchedSites[siteIndex]),
  }));
  const matchedCount = matchedSites.filter((s) => s.matchedFeature).length;

  return {
    matchedSites,
    matchedItems,
    matchedCount,
    unmatchedCount: sites.length - matchedCount,
  };
}

/**
 * Parses an Excel (.xlsx, .xls) or CSV file in real-time, extracts sites,
 * and matches them against any provided KMZ network polygons.
 */
export async function parseSpreadsheetForPreview(
  file: File,
  currentKmzItems: FiberInventoryItemT[] = [],
): Promise<SpreadsheetPreviewData> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  if (!workbook.SheetNames.length) {
    throw new Error("Spreadsheet contains no sheets");
  }

  const uniqueSites: FiberSiteT[] = parseFiberSiteSheets(
    workbook.SheetNames.flatMap((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) return [];
      return [
        XLSX.utils.sheet_to_json<unknown[]>(sheet, {
          header: 1,
          defval: "",
          blankrows: false,
        }),
      ];
    }),
  ).map((site) => ({
    ...site,
    matchedFeature: null,
    matchedKind: null,
    matchedDistance: null,
  }));

  if (uniqueSites.length === 0) {
    throw new Error(
      `No valid site coordinates found. Please verify column headers: ${FIBER_SITE_REQUIRED_HEADERS}`,
    );
  }

  const { matchedSites, matchedCount, unmatchedCount } = matchSitesToItems(
    uniqueSites,
    currentKmzItems,
  );

  return {
    fileName: file.name,
    fileSize: file.size,
    sites: matchedSites,
    matchedCount,
    unmatchedCount,
  };
}
