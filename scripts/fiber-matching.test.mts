import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { matchSitesToFeatures } from "../packages/schema/src/fiber-inventory/matching.ts";

// Keep the original exhaustive search as an oracle for the indexed search.
const source =
  readFileSync(
    new URL(
      "../packages/schema/src/fiber-inventory/matching.ts",
      import.meta.url,
    ),
    "utf8",
  )
    .replace(
      "for (const f of nearby(polygonIndex, site))",
      "for (const f of polygons)",
    )
    .replace(
      "for (const f of nearby(networkIndex, site, dLat, dLng))",
      "for (const f of others)",
    )
    .replace(
      "nearest(site, nearestIndex, items.length)",
      "linearNearest(site, nearestCandidates)",
    ) +
  `
function linearNearest(p, candidates) {
  let best = null;
  for (const f of candidates) {
    if (best && boxDistance(p, f) >= best.distance) continue;
    const distance = distanceTo(p, f.feature.geom);
    if (!best || distance < best.distance) best = {f, distance};
  }
  return best;
}`;
const reference = await import(
  `data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString("base64")}`
);

test("indexed matching preserves exhaustive results for random routes, points, zones and unmatched sites", () => {
  let seed = 137;
  const random = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  const features = Array.from({ length: 300 }, (_, i) => {
    const lat = 6 + random() * 0.2,
      lng = -5 + random() * 0.2;
    const kind = (["polygon", "line", "point"] as const)[i % 3];
    return {
      name: `Feature ${i}`,
      kind,
      category: i % 13 === 0 ? ("manhole" as const) : ("other" as const),
      geom:
        kind === "point"
          ? [{ lat, lng }]
          : kind === "line"
            ? [
                { lat, lng },
                { lat: lat + 0.005, lng: lng + 0.005 },
              ]
            : [
                { lat, lng },
                { lat: lat + 0.01, lng },
                { lat: lat + 0.01, lng: lng + 0.01 },
                { lat, lng: lng + 0.01 },
                { lat, lng },
              ],
    };
  });
  const sites = Array.from({ length: 400 }, () => ({
    lat: 6 + random() * 0.3,
    lng: -5 + random() * 0.3,
  }));
  assert.deepEqual(
    matchSitesToFeatures(sites, features),
    reference.matchSitesToFeatures(sites, features),
  );
});

test("ties, nested polygons, excluded manholes, and empty inventories keep their original behaviour", () => {
  const geom = [{ lat: 6, lng: -5 }];
  const features = [
    {
      name: "Manhole",
      kind: "point" as const,
      category: "manhole" as const,
      geom,
    },
    { name: "First", kind: "point" as const, geom },
    { name: "Second", kind: "point" as const, geom },
    ...[0.01, 0.005, 0.005].map((size, i) => ({
      name: `Zone ${i}`,
      kind: "polygon" as const,
      geom: [
        { lat: 6 - size, lng: -5 - size },
        { lat: 6 + size, lng: -5 - size },
        { lat: 6 + size, lng: -5 + size },
        { lat: 6 - size, lng: -5 + size },
        { lat: 6 - size, lng: -5 - size },
      ],
    })),
  ];
  const sites = [
    { lat: 6, lng: -5 },
    { lat: 20, lng: 20 },
    { lat: 6.005, lng: -5 },
  ];
  for (const items of [
    features,
    features.slice(0, 3),
    features.slice(0, 1),
    [],
  ]) {
    assert.deepEqual(
      matchSitesToFeatures(sites, items),
      reference.matchSitesToFeatures(sites, items),
    );
  }
});
