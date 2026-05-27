import type {
  BoundingBoxT,
  CoordsT,
  MultiPolygonT,
  PolygonT,
} from "schema/geo";
import { bad } from "#/utils";

export function getBoundingBox(mp: MultiPolygonT): BoundingBoxT {
  const p0 = mp[0][0][0];
  let n = p0.lat;
  let s = p0.lat;
  let e = p0.lon;
  let w = p0.lon;
  if (!n) bad(`No coords in ${JSON.stringify([mp[0][0][0], mp[0][0], mp[0]])}`);
  for (const poly of mp) {
    for (const { lon, lat } of poly[0]) {
      if (!lon) bad(`No coords in ${JSON.stringify(poly)}`);
      if (lon > e) e = lon;
      if (lon < w) w = lon;
      if (lat > n) n = lat;
      if (lat < s) s = lat;
    }
  }
  return { west: w, south: s, east: e, north: n };
}

/** Checks if a ray extending eastward from p crosses the edge between vertices v1 and v2. */
export function doesEdgeCrossRay(v1: CoordsT, v2: CoordsT, p: CoordsT) {
  const { lon: lon1, lat: lat1 } = v1;
  const { lon: lon2, lat: lat2 } = v2;
  const { lon, lat } = p;

  // edges that are fully to the west of the ray do not cross it
  if (lon1 < lon && lon2 < lon) return false;

  // edges parallel to the ray do not cross it
  if (lat1 === lat2) return false;

  // the edge crosses if the points are on opposite sides of the ray
  return (lat1 >= lat && lat >= lat2) || (lat2 >= lat && lat >= lat1);
}

export function sqDist(a: CoordsT, b: CoordsT) {
  const dx = b.lat - a.lat;
  const dy = b.lon - a.lon;
  return dx * dx + dy * dy;
}

export function closestVertex(c: CoordsT, p: PolygonT) {
  let minDist = Infinity;
  let closest = p[0][0];
  for (const ring of p) {
    for (const point of ring) {
      const dist = sqDist(c, point);
      if (dist < minDist) {
        minDist = dist;
        closest = point;
      }
    }
  }
  return closest;
}

export function trueCentreOfPolygon(poly: PolygonT): CoordsT {
  // get the average latitude and longitude of the outer ring
  // excluding the last point, which is the same as the first
  const ring = poly[0];
  if (ring.length < 2) return ring[0];

  const n = ring.length - 1;
  const lon = ring.reduce((a, b) => a + b.lon, 0) / n;
  const lat = ring.reduce((a, b) => a + b.lat, 0) / n;
  return { lon, lat };
}

export function visualCentreOfPolygon(p: PolygonT): CoordsT {
  const c = trueCentreOfPolygon(p);
  return isInsidePolygon(c, p) ? c : closestVertex(c, p);
}

/**  Checks if the point falls within the area of the polygon. */
export function isInsidePolygon(c: CoordsT, p: PolygonT) {
  let inside = false;
  for (const ring of p) {
    for (let i = 1; i < ring.length; i++) {
      // odd number of edge crosses = inside, even = outside
      if (doesEdgeCrossRay(ring[i - 1], ring[i], c)) inside = !inside;
    }
  }
  return inside;
  // NOTE: with the way it is implemented, the first point on
  // any ring of the polygon is considered to be outside the polygon.
  // This isn't correct, but it doesn't break any functionality,
  // so we'll leave it as-is for simplicity's sake.
  // This whole thing is just for the Local Government Area detection,
  // it's not meant to be a perfectly robust GeoJSON implementation.
}

/**  Checks if the point falls within any of the polygons. */
export function isInsideMp(c: CoordsT, mp: MultiPolygonT) {
  return mp.some((poly) => isInsidePolygon(c, poly));
}

export function isInsideBox(c: CoordsT, box: BoundingBoxT) {
  const { lon, lat } = c;
  const { west: w, south: s, east: e, north: n } = box;
  return w <= lon && lon <= e && s <= lat && lat <= n;
}
