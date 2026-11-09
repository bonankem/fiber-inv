import type { FiberSiteT } from "schema/fiber-inventory";

export type SiteGroup = {
  key: string;
  sites: FiberSiteT[];
  center: { lat: number; lng: number };
  matched: number;
};

/** Screen-space grouping stays enabled at close zooms for dense imports. */
export function clusterSites(sites: FiberSiteT[], zoom: number): SiteGroup[] {
  const world = 256 * 2 ** zoom;
  const cells = new Map<string, SiteGroup>();
  for (const site of sites) {
    const lat = Math.max(-85.05112878, Math.min(85.05112878, site.lat));
    const sin = Math.sin((lat * Math.PI) / 180);
    const x = ((site.lng + 180) / 360) * world;
    const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * world;
    const key = `${Math.floor(x / 72)}:${Math.floor(y / 72)}`;
    const cell = cells.get(key);
    if (cell) {
      cell.sites.push(site);
      cell.center.lat += site.lat;
      cell.center.lng += site.lng;
      cell.matched += Number(Boolean(site.matchedFeature));
    } else {
      cells.set(key, {
        key,
        sites: [site],
        center: { lat: site.lat, lng: site.lng },
        matched: Number(Boolean(site.matchedFeature)),
      });
    }
  }
  return [...cells.values()].map((cell) => ({
    ...cell,
    center: {
      lat: cell.center.lat / cell.sites.length,
      lng: cell.center.lng / cell.sites.length,
    },
  }));
}
