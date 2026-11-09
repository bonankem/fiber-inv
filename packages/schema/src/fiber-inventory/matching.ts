/**
 * Shared site-to-network matcher, used by both the upload preview (web) and
 * the inventory API (backend).
 *
 * A site matches the smallest polygon containing it; otherwise the nearest
 * line (fiber route) or point (POP) within `radiusM` metres. Manholes are
 * never matched: they are civil works on a route, not a site's network
 * attachment point.
 */

type LatLng = { lat: number; lng: number };
type FeatureKind = "polygon" | "line" | "point";

type MatchableFeature = {
  name: string;
  kind: FeatureKind;
  geom: LatLng[];
  category?: "manhole" | "other";
};

export type FiberSiteMatchT = {
  matchedFeature: string | null;
  matchedKind: FeatureKind | null;
  matchedDistance: number | null;
  /** Closest network feature at any distance, for planning unmatched sites */
  nearestFeature: string | null;
  nearestDistance: number | null;
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
  let ax = (geom[0].lng - p.lng) * kx;
  let ay = (geom[0].lat - p.lat) * ky;
  let bestSquared = ax * ax + ay * ay;
  for (let i = 1; i < geom.length; i++) {
    const bx = (geom[i].lng - p.lng) * kx;
    const by = (geom[i].lat - p.lat) * ky;
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
    const x = ax + t * dx;
    const y = ay + t * dy;
    bestSquared = Math.min(bestSquared, x * x + y * y);
    ax = bx;
    ay = by;
  }
  return Math.sqrt(bestSquared);
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

/** Metres from `p` to a feature's bounding box: a lower bound on its distance */
function boxDistance(
  p: LatLng,
  f: Pick<Indexed, "minLat" | "maxLat" | "minLng" | "maxLng">,
) {
  const kx = M_PER_DEG_LNG * Math.cos((p.lat * Math.PI) / 180);
  const dx = Math.max(f.minLng - p.lng, 0, p.lng - f.maxLng) * kx;
  const dy = Math.max(f.minLat - p.lat, 0, p.lat - f.maxLat) * M_PER_DEG_LAT;
  return Math.hypot(dx, dy);
}

type SpatialNode = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  children?: [SpatialNode, SpatialNode];
  entries?: Indexed[];
};

/** Bounding-volume tree: built once, reused by every site in this batch. */
function spatialIndex(entries: Indexed[]): SpatialNode | null {
  if (!entries.length) return null;
  const node: SpatialNode = {
    minLat: Infinity,
    maxLat: -Infinity,
    minLng: Infinity,
    maxLng: -Infinity,
  };
  for (const entry of entries) {
    node.minLat = Math.min(node.minLat, entry.minLat);
    node.maxLat = Math.max(node.maxLat, entry.maxLat);
    node.minLng = Math.min(node.minLng, entry.minLng);
    node.maxLng = Math.max(node.maxLng, entry.maxLng);
  }
  if (entries.length <= 12) node.entries = entries;
  else {
    const latitude = node.maxLat - node.minLat > node.maxLng - node.minLng;
    const sorted = [...entries].sort((a, b) =>
      latitude
        ? a.minLat + a.maxLat - (b.minLat + b.maxLat)
        : a.minLng + a.maxLng - (b.minLng + b.maxLng),
    );
    const mid = Math.floor(sorted.length / 2);
    const left = spatialIndex(sorted.slice(0, mid));
    const right = spatialIndex(sorted.slice(mid));
    if (left && right) node.children = [left, right];
  }
  return node;
}

function nearby(
  root: SpatialNode | null,
  p: LatLng,
  dLat = 0,
  dLng = 0,
): Indexed[] {
  const found: Indexed[] = [];
  const intersects = (node: SpatialNode) =>
    p.lat >= node.minLat - dLat &&
    p.lat <= node.maxLat + dLat &&
    p.lng >= node.minLng - dLng &&
    p.lng <= node.maxLng + dLng;
  const visit = (node: SpatialNode) => {
    if (!intersects(node)) return;
    if (node.entries) found.push(...node.entries);
    else if (node.children) {
      visit(node.children[0]);
      visit(node.children[1]);
    }
  };
  if (root) visit(root);
  // Preserve source order for equally close features and equal-area polygons.
  return found.sort((a, b) => a.index - b.index);
}

/** Closest feature at any distance, pruning whole branches of distant boxes. */
function nearest(
  p: LatLng,
  root: SpatialNode | null,
  itemCount: number,
): { f: Indexed; distance: number } | null {
  let best: { f: Indexed; distance: number } | null = null;
  const rank = (f: Indexed) =>
    f.index + (f.feature.kind === "polygon" ? 0 : itemCount);
  const visit = (node: SpatialNode) => {
    if (best && boxDistance(p, node) > best.distance) return;
    if (node.entries) {
      for (const f of node.entries) {
        if (best && boxDistance(p, f) > best.distance) continue;
        const distance = distanceTo(p, f.feature.geom);
        if (
          !best ||
          distance < best.distance ||
          (distance === best.distance && rank(f) < rank(best.f))
        )
          best = { f, distance };
      }
    } else if (node.children) {
      const [a, b] = node.children;
      if (boxDistance(p, a) <= boxDistance(p, b)) {
        visit(a);
        visit(b);
      } else {
        visit(b);
        visit(a);
      }
    }
  };
  if (root) visit(root);
  return best;
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
  const others = indexed.filter(
    (f) => f.feature.kind !== "polygon" && f.feature.category !== "manhole",
  );
  const siteIndexesByItem = items.map((): number[] => []);
  // polygon edges count too: an unmatched site may sit just outside a zone
  const nearestCandidates = [...polygons, ...others];
  const polygonIndex = spatialIndex(polygons);
  const networkIndex = spatialIndex(others);
  const nearestIndex = spatialIndex(nearestCandidates);

  const matched = sites.map((site, siteIndex) => {
    let best: { f: Indexed; distance: number } | null = null;

    for (const f of nearby(polygonIndex, site)) {
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
      for (const f of nearby(networkIndex, site, dLat, dLng)) {
        if (
          site.lat < f.minLat - dLat ||
          site.lat > f.maxLat + dLat ||
          site.lng < f.minLng - dLng ||
          site.lng > f.maxLng + dLng
        ) {
          continue;
        }
        if (best && boxDistance(site, f) >= best.distance) continue;
        const distance = distanceTo(site, f.feature.geom);
        if (distance > radiusM) continue;
        if (!best || distance < best.distance) best = { f, distance };
      }
    }

    if (!best) {
      const near = nearest(site, nearestIndex, items.length);
      return {
        ...site,
        matchedFeature: null,
        matchedKind: null,
        matchedDistance: null,
        nearestFeature: near ? featureLabel(near.f.feature) : null,
        nearestDistance: near ? Math.round(near.distance) : null,
      };
    }
    siteIndexesByItem[best.f.index].push(siteIndex);
    return {
      ...site,
      matchedFeature: featureLabel(best.f.feature),
      matchedKind: best.f.feature.kind,
      matchedDistance: Math.round(best.distance),
      nearestFeature: featureLabel(best.f.feature),
      nearestDistance: Math.round(best.distance),
    };
  });

  return { sites: matched, siteIndexesByItem };
}
