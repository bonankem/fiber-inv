import type { FiberInventoryItemT } from "schema/fiber-inventory";

/** Manholes are hidden below this zoom, and labelled from MANHOLE_LABEL_ZOOM */
export const MANHOLE_MIN_ZOOM = 12;
export const MANHOLE_LABEL_ZOOM = 17;

export const MANHOLE_COLORS = {
  existing: "#16a34a",
  new: "#2563eb",
  unknown: "#71717a",
} as const;

export type ManholeStatusKey = keyof typeof MANHOLE_COLORS;

export function manholeStatusKey(item: FiberInventoryItemT): ManholeStatusKey {
  return item.status ?? "unknown";
}

export function manholeColor(item: FiberInventoryItemT) {
  return MANHOLE_COLORS[manholeStatusKey(item)];
}

export const MANHOLE_STATUS_LABELS: Record<ManholeStatusKey, string> = {
  existing: "Existing",
  new: "New / built",
  unknown: "Unknown",
};

export function manholeStatusLabel(item: FiberInventoryItemT) {
  return MANHOLE_STATUS_LABELS[manholeStatusKey(item)];
}

export function isManhole(item: FiberInventoryItemT) {
  return item.kind === "point" && item.category === "manhole";
}
