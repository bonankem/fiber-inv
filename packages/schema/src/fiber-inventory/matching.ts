/**
 * Shared site-to-network matcher, used by both the upload preview (web) and
 * the inventory API (backend).
 *
 * A site matches the smallest polygon containing it; otherwise the nearest
 * line (fiber route) or point (POP / manhole) within `radiusM` metres.
 */

type LatLng = { lat: number; lng: number };
type FeatureKind = "polygon" | "line" | "point";

type MatchableFeature = {
  name: string;
  kind: FeatureKind;
  geom: LatLng[];
};

export type FiberSiteMatchT = {
  matchedFeature: string | null;
  matchedKind: FeatureKind | null;
  matchedDistance: number | null;
};

/** Default search radius around a site for lines and points, in metres. */
export const FIBER_MATCH_RADIUS_M = 500;

const M_PER_DEG_LAT = 110_540;
const M_PER_DEG_LNG = 111_320;

export function featureLabel(f: { name: string; kind: FeatureKind }) {
  return f.name.trim() || `Unnamed ${f.kind}`;
}

function isInside(p: LatLng, ring: LatLng[]) {
  if (ring.length < 3) return false;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (
      a.lat > p.lat !== b.lat > p.lat &&
      p.lng < ((b.lng - a.lng) * (p.lat - a.lat)) / (b.lat - a.lat) + a.lng
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function ringArea(ring: LatLng[]) {
  let area = 0;
  for (let i = 0; i < ring.length; i++) {
    const next = ring[(i + 1) % ring.length];
    area += ring[i].lng * next.lat - next.lng * ring[i].lat;
  }
  return Math.abs(area / 2);
}

/**
 * Distance in metres from `p` to the polyline (or single point) `geom`,
 * using an equirectangular projection centred on `p` (accurate at the
 * sub-kilometre scale this matcher works at).
 */
function distanceTo(p: LatLng, geom: LatLng[]) {
  const kx = M_PER_DEG_LNG * Math.cos((p.lat * Math.PI) / 180);
  const ky = M_PER_DEG_LAT;
  const xy = (c: LatLng) => [(c.lng - p.lng) * kx, (c.lat - p.lat) * ky];

  let [ax, ay] = xy(geom[0]);
  let best = Math.hypot(ax, ay);
  for (let i = 1; i < geom.length; i++) {
    const [bx, by] = xy(geom[i]);
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
    best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
    ax = bx;
    ay = by;
  }
  return best;
}

type Indexed = {
  index: number;
  feature: MatchableFeature;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  area: number;
};

function indexFeature(feature: MatchableFeature, index: number): Indexed {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const c of feature.geom) {
    minLat = Math.min(minLat, c.lat);
    maxLat = Math.max(maxLat, c.lat);
    minLng = Math.min(minLng, c.lng);
    maxLng = Math.max(maxLng, c.lng);
  }
  const area = feature.kind === "polygon" ? ringArea(feature.geom) : 0;
  return { index, feature, minLat, maxLat, minLng, maxLng, area };
}

/**
 * Matches every site to a network feature. Returns the sites with their match
 * fields set, and, for each feature (same order as `items`), the indexes of
 * the sites matched to it.
 */
export function matchSitesToFeatures<S extends LatLng>(
  sites: S[],
  items: MatchableFeature[],
  radiusM = FIBER_MATCH_RADIUS_M,
): { sites: (S & FiberSiteMatchT)[]; siteIndexesByItem: number[][] } {
  const indexed = items.flatMap((f, i) =>
    f.geom.length ? [indexFeature(f, i)] : [],
  );
  const polygons = indexed.filter((f) => f.feature.kind === "polygon");
  const others = indexed.filter((f) => f.feature.kind !== "polygon");
  const siteIndexesByItem = items.map((): number[] => []);

  const matched = sites.map((site, siteIndex) => {
    let best: { f: Indexed; distance: number } | null = null;

    for (const f of polygons) {
      if (
        site.lat < f.minLat ||
        site.lat > f.maxLat ||
        site.lng < f.minLng ||
        site.lng > f.maxLng
      ) {
        continue;
      }
      if (!isInside(site, f.feature.geom)) continue;
      if (!best || f.area < best.f.area) best = { f, distance: 0 };
    }

    if (!best) {
      const dLat = radiusM / M_PER_DEG_LAT;
      const dLng =
        radiusM / (M_PER_DEG_LNG * Math.cos((site.lat * Math.PI) / 180));
      for (const f of others) {
        if (
          site.lat < f.minLat - dLat ||
          site.lat > f.maxLat + dLat ||
          site.lng < f.minLng - dLng ||
          site.lng > f.maxLng + dLng
        ) {
          continue;
        }
        const distance = distanceTo(site, f.feature.geom);
        if (distance > radiusM) continue;
        if (!best || distance < best.distance) best = { f, distance };
      }
    }

    if (!best) {
      return {
        ...site,
        matchedFeature: null,
        matchedKind: null,
        matchedDistance: null,
      };
    }
    siteIndexesByItem[best.f.index].push(siteIndex);
    return {
      ...site,
      matchedFeature: featureLabel(best.f.feature),
      matchedKind: best.f.feature.kind,
      matchedDistance: Math.round(best.distance),
    };
  });

  return { sites: matched, siteIndexesByItem };
}
