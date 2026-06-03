import { mean, unique } from "remeda";
import type { CoordsT, LinearRingT } from "schema/geo";

export function getBoundingBox(l: LinearRingT) {
  const p0 = l[0];
  let north = p0.lat;
  let south = p0.lat;
  let east = p0.lng;
  let west = p0.lng;
  for (const { lng, lat } of l) {
    if (lng > east) east = lng;
    if (lng < west) west = lng;
    if (lat > north) north = lat;
    if (lat < south) south = lat;
  }
  return { north, south, east, west };
}

export function ringWithBbox(ring: LinearRingT) {
  return { ring, ...getBoundingBox(ring) };
}

/** Checks if a ray extending eastward from p crosses the edge between vertices v1 and v2. */
export function doesEdgeCrossRay(
  v1: CoordsT,
  v2: CoordsT,
  p: CoordsT,
): boolean {
  const { lng: lng1, lat: lat1 } = v1;
  const { lng: lng2, lat: lat2 } = v2;
  const { lng, lat } = p;

  // edges that are fully to the west of the ray do not cross it
  if (lng1 < lng && lng2 < lng) return false;

  // edges parallel to the ray do not cross it
  if (lat1 === lat2) return false;

  // the edge crosses if the points are on opposite sides of the ray
  return (lat1 >= lat && lat >= lat2) || (lat2 >= lat && lat >= lat1);
}

export function nearestVertex(c: CoordsT, ring: LinearRingT) {
  let minDist = Infinity;
  let closest = ring[0];
  for (const p of ring) {
    const dx = p.lat - c.lat;
    const dy = p.lng - c.lng;
    const dist = dx * dx + dy * dy;
    if (dist < minDist) {
      minDist = dist;
      closest = p;
    }
  }
  return closest;
}

function bboxCentre(ring: LinearRingT): CoordsT {
  const box = getBoundingBox(ring);
  const lat = (box.north + box.south) / 2;
  const lng = (box.east + box.west) / 2;
  return { lat, lng };
}

function ringMeanPoint(ring: LinearRingT): CoordsT {
  const lat = mean(unique(ring.map((r) => r.lat)));
  const lng = mean(unique(ring.map((r) => r.lng)));
  return lat && lng ? { lat, lng } : ring[0];
}

export function ringCentre(l: LinearRingT): CoordsT {
  const cb = bboxCentre(l);
  if (isInsideRing(cb, l)) return cb;

  const mp = ringMeanPoint(l);
  if (isInsideRing(mp, l)) return mp;

  return nearestVertex(mp, l);
}

export function isInsideRing(c: CoordsT, ring: LinearRingT): boolean {
  let crosses = 0;
  for (let i = 1; i < ring.length; i++) {
    if (doesEdgeCrossRay(ring[i - 1], ring[i], c)) crosses++;
  }
  // odd number of edge crosses = inside, even = outside
  return crosses % 2 === 1;
}
