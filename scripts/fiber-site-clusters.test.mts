import assert from "node:assert/strict";
import { test } from "node:test";
import { clusterSites } from "../apps/web/src/modules/fiber-inventory/utils/site-clusters.ts";

const site = (code: string, lat: number, lng: number, matched = true) => ({
  code,
  siteName: code,
  locality: "Demo",
  lat,
  lng,
  matchedFeature: matched ? "Route" : null,
  matchedKind: matched ? ("line" as const) : null,
  matchedDistance: matched ? 0 : null,
});

test("3,000 nearby sites remain clustered above the former zoom-12 cutoff", () => {
  const sites = Array.from({ length: 3000 }, (_, i) =>
    site(String(i), 6 + i * 0.00000001, -5, i % 2 === 0),
  );
  const groups = clusterSites(sites, 14);
  assert.ok(groups.length < 10);
  assert.equal(
    groups.reduce((n, g) => n + g.sites.length, 0),
    3000,
  );
  assert.equal(
    groups.reduce((n, g) => n + g.matched, 0),
    1500,
  );
  assert.equal(
    new Set(groups.flatMap((g) => g.sites.map((s) => s.code))).size,
    3000,
  );
});

test("zooming separates nearby sites without changing their identities", () => {
  const a = site("A", 6, -5),
    b = site("B", 6.0001, -5);
  assert.equal(clusterSites([a, b], 7).length, 1);
  assert.equal(clusterSites([a, b], 21).length, 2);
  assert.equal(clusterSites([a], 21)[0].sites[0], a);
});

test("coincident sites stay accessible as a counted cluster and polar coordinates stay finite", () => {
  const groups = clusterSites([site("A", 90, 0), site("B", 90, 0, false)], 21);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].matched, 1);
  assert.ok(!/Infinity|NaN/.test(groups[0].key));
  assert.deepEqual(clusterSites([], 12), []);
});
