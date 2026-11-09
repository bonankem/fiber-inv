import { useSyncExternalStore } from "react";
import type { FiberInventoryItemT, FiberSiteT } from "schema/fiber-inventory";
import type { SelectedMapItem } from "./types";

/**
 * Lets the Info drawer (opened from the page header) ask the inventory map
 * to fly to a site or a feature such as a manhole. `at` makes clicking the
 * same entry twice fire again.
 */
type MapFocus = { target: SelectedMapItem; at: number };

let current: MapFocus | null = null;
const listeners = new Set<() => void>();

function set(value: MapFocus | null) {
  current = value;
  for (const listener of listeners) listener();
}

export function focusSite(site: FiberSiteT) {
  set({ target: { kind: "site", site }, at: Date.now() });
}

export function focusFeature(item: FiberInventoryItemT) {
  set({ target: { kind: "feature", item }, at: Date.now() });
}

/** Called once the map has moved, so a remounted map won't replay it */
export function clearMapFocus() {
  if (current) set(null);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useMapFocus() {
  return useSyncExternalStore(subscribe, () => current);
}
