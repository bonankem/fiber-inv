import type { FiberInventoryItemT, FiberSiteT } from "schema/fiber-inventory";

/**
 * Describes how a site was matched to the network, e.g. "Inside Zone A" or
 * "POP BOUAKE · 120 m". Returns null for unmatched sites.
 */
export function describeMatch(site: FiberSiteT): string | null {
  if (!site.matchedFeature) return null;
  if (site.matchedKind === "polygon") return `Inside ${site.matchedFeature}`;
  return `${site.matchedFeature} · ${site.matchedDistance ?? 0} m`;
}

/**
 * Calculates the mean center of a set of coordinate points.
 */
export function centerOf(points: { lat: number; lng: number }[]): {
  lat: number;
  lng: number;
} {
  if (!points.length) return { lat: 7.5, lng: -5.5 };
  const totals = points.reduce(
    (sum, point) => ({ lat: sum.lat + point.lat, lng: sum.lng + point.lng }),
    { lat: 0, lng: 0 },
  );
  return {
    lat: totals.lat / points.length,
    lng: totals.lng / points.length,
  };
}

/**
 * Computes a LatLngBounds object encompassing all geometry items and sites.
 */
export function computeBounds(
  items: FiberInventoryItemT[],
  sites: FiberSiteT[] = [],
): google.maps.LatLngBounds | null {
  if (typeof google === "undefined" || !google.maps) return null;
  const bounds = new google.maps.LatLngBounds();
  let hasPoints = false;

  for (const item of items) {
    for (const pt of item.geom) {
      bounds.extend(pt);
      hasPoints = true;
    }
  }

  for (const site of sites) {
    bounds.extend({ lat: site.lat, lng: site.lng });
    hasPoints = true;
  }

  return hasPoints ? bounds : null;
}
