import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import XLSX from "@e965/xlsx";
import { configDotenv } from "dotenv";
import pg from "pg";
import type { FiberInventoryT } from "schema/fiber-inventory";
import { matchSitesToFeatures } from "../../packages/schema/src/fiber-inventory/matching";
import { parseFiberSiteSheets } from "../../packages/schema/src/fiber-inventory/sites";
import { clusterSites } from "../web/src/modules/fiber-inventory/utils/site-clusters";

configDotenv({ quiet: true });
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: /^(true|1)$/.test(process.env.DB_SSL ?? "")
    ? { rejectUnauthorized: false }
    : undefined,
  connectionTimeoutMillis: 10000,
});
try {
  await client.connect();
  const start = performance.now();
  const result = await client.query(
    'SELECT data FROM "FiberSnapshot" WHERE id = $1',
    ["current"],
  );
  const data = result.rows[0]?.data as FiberInventoryT | undefined;
  if (!data) throw new Error("No inventory snapshot available");
  const readMs = performance.now() - start;
  const workbook = process.argv[2]
    ? XLSX.read(readFileSync(process.argv[2]))
    : null;
  const sites = workbook
    ? parseFiberSiteSheets(
        workbook.SheetNames.map((name) =>
          XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[name], {
            header: 1,
            defval: "",
            blankrows: false,
          }),
        ),
      )
    : data.sites;
  const matchingStart = performance.now();
  const matched = matchSitesToFeatures(sites, data.items).sites;
  const matchingMs = performance.now() - matchingStart;
  const matchesSavedAssignments = workbook
    ? null
    : matched.every((site, i) => {
        const saved = data.sites[i];
        return (
          site.matchedFeature === saved.matchedFeature &&
          site.matchedKind === saved.matchedKind &&
          site.matchedDistance === saved.matchedDistance &&
          (site.nearestFeature ?? null) === (saved.nearestFeature ?? null) &&
          (site.nearestDistance ?? null) === (saved.nearestDistance ?? null)
        );
      });
  const clusteringStart = performance.now();
  const groups = clusterSites(matched, 12);
  const clusteringMs = performance.now() - clusteringStart;
  console.log(
    JSON.stringify(
      {
        networkFeatures: data.items.length,
        geometryVertices: data.items.reduce((n, f) => n + f.geom.length, 0),
        largestGeometries: [...data.items]
          .sort((a, b) => b.geom.length - a.geom.length)
          .slice(0, 3)
          .map((f) => ({ kind: f.kind, vertices: f.geom.length })),
        savedSites: data.sites.length,
        benchmarkSites: sites.length,
        matched: matched.filter((s) => s.matchedFeature).length,
        matchesSavedAssignments,
        snapshotReadMs: Math.round(readMs),
        matchingMs: Math.round(matchingMs),
        clusteringMs: Math.round(clusteringMs),
        clustersAtZoom12BeforeViewportFiltering: groups.length,
        snapshotMegabytes: +(
          Buffer.byteLength(JSON.stringify(data)) /
          1024 /
          1024
        ).toFixed(2),
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message.replace(/postgres(?:ql)?:\/\/\S+/g, "[redacted]")
      : "Benchmark failed",
  );
  process.exitCode = 1;
} finally {
  await client.end();
}
