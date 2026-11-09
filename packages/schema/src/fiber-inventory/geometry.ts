/** Small geometry helpers for the fiber inventory (metric, equirectangular). */

type LatLng = { lat: number; lng: number };

const R = 6_371_000;
const rad = (d: number) => (d * Math.PI) / 180;

export function distanceM(a: LatLng, b: LatLng) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Length of a polyline in metres */
export function lineLengthM(geom: LatLng[]) {
  let total = 0;
  for (let i = 1; i < geom.length; i++)
    total += distanceM(geom[i - 1], geom[i]);
  return total;
}

/**
 * Douglas-Peucker simplification: drops vertices closer than `toleranceM` to
 * the line, keeping the first and last. Keeps the map light for CAD exports.
 */
export function simplifyLine<T extends LatLng>(geom: T[], toleranceM = 1): T[] {
  if (geom.length <= 2) return geom;
  const kx = 111_320 * Math.cos(rad(geom[0].lat));
  const ky = 110_540;
  const xy = geom.map((p) => [p.lng * kx, p.lat * ky] as const);
  const keep = new Uint8Array(geom.length);
  keep[0] = keep[geom.length - 1] = 1;

  const stack: [number, number][] = [[0, geom.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop() as [number, number];
    const [ax, ay] = xy[s];
    const [bx, by] = xy[e];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let best = -1;
    let bestD = toleranceM;
    for (let i = s + 1; i < e; i++) {
      const [px, py] = xy[i];
      const t = len2
        ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2))
        : 0;
      const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      if (d > bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best >= 0) {
      keep[best] = 1;
      stack.push([s, best], [best, e]);
    }
  }
  return geom.filter((_, i) => keep[i]);
}
