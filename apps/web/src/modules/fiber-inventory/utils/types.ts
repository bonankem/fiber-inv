import type {
  FiberInventoryItemT,
  FiberLayerT,
  FiberSiteT,
} from "schema/fiber-inventory";

export type KmzPreviewData = {
  fileName: string;
  fileSize: number;
  items: FiberInventoryItemT[];
  /** Every layer in the file with its feature count */
  layers: FiberLayerT[];
  summary: {
    polygons: number;
    lines: number;
    points: number;
    manholes: number;
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
