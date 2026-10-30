import type { FiberInventoryItemT, FiberSiteT } from "schema/fiber-inventory";

export type KmzPreviewData = {
  fileName: string;
  fileSize: number;
  items: FiberInventoryItemT[];
  summary: {
    polygons: number;
    lines: number;
    points: number;
  };
};

export type ParsedSite = FiberSiteT;

export type SpreadsheetPreviewData = {
  fileName: string;
  fileSize: number;
  sites: FiberSiteT[];
  matchedCount: number;
  unmatchedCount: number;
};

export type SelectedMapItem =
  | { kind: "site"; site: FiberSiteT }
  | { kind: "feature"; item: FiberInventoryItemT };
