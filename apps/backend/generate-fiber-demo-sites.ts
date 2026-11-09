import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import XLSX from "@e965/xlsx";
import { configDotenv } from "dotenv";
import pg from "pg";
import { matchSitesToFeatures } from "../../packages/schema/src/fiber-inventory/matching";
import { parseFiberSiteSheets } from "../../packages/schema/src/fiber-inventory/sites";

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
  const result = await client.query(
    'SELECT data FROM "FiberSnapshot" WHERE id = $1',
    ["current"],
  );
  const data = result.rows[0]?.data;
  if (!data?.items?.length)
    throw new Error("No stored network snapshot available");
  const sources = new Map(data.uploads.map((s: any) => [s.id, s.name]));
  const lines = data.items.filter(
    (f: any) =>
      f.kind === "line" && f.category !== "manhole" && f.geom.length > 1,
  );
  if (!lines.length) throw new Error("No enabled network lines available");
  const rows: Record<string, unknown>[] = [];
  const seen = new Set<string>();
  // Spread samples across source lines; use additional positions if needed.
  for (let pass = 0; pass < 100 && rows.length < 3000; pass++) {
    const fraction = pass === 0 ? 0.5 : (pass * 0.61803398875) % 1;
    for (const line of lines) {
      const position = fraction * (line.geom.length - 1);
      const i = Math.min(Math.floor(position), line.geom.length - 2);
      const t = position - i;
      const a = line.geom[i],
        b = line.geom[i + 1];
      const lat = Math.round((a.lat + (b.lat - a.lat) * t) * 1e5) / 1e5;
      const lng = Math.round((a.lng + (b.lng - a.lng) * t) * 1e5) / 1e5;
      const key = `${lat},${lng}`;
      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        Math.abs(lat) > 90 ||
        Math.abs(lng) > 180 ||
        (!lat && !lng) ||
        seen.has(key)
      )
        continue;
      seen.add(key);
      const code = `DEMO-FIBER-${String(rows.length + 1).padStart(5, "0")}`;
      rows.push({
        Code: code,
        "Site Name": `DEMO Site ${rows.length + 1}`,
        Locality: "Synthetic network sample",
        Latitude: lat,
        Longitude: lng,
        "Source KMZ": sources.get(line.sourceId) ?? "Unknown",
        "Sampled Feature": line.name,
        "Source Layer": line.layer ?? "",
        "Data Type": "SYNTHETIC - not a surveyed site",
      });
      if (rows.length >= 3000) break;
    }
  }
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(rows),
    "Demo Sites",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      [
        "Purpose",
        "Synthetic sites sampled along enabled KMZ lines for map population and testing.",
      ],
      [
        "Warning",
        "These are generated demonstration records, not real or surveyed sites.",
      ],
      [
        "Requirement",
        "Keep the source KMZ files enabled with the sampled layers included.",
      ],
      ["Generated UTC", new Date().toISOString()],
    ]),
    "Read Me",
  );
  // Validate the serialized workbook with the same parser and matcher as uploads.
  const bytes = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const readback = XLSX.read(bytes);
  const sites = parseFiberSiteSheets(
    readback.SheetNames.map((name) =>
      XLSX.utils.sheet_to_json(readback.Sheets[name], {
        header: 1,
        defval: "",
        blankrows: false,
      }),
    ),
  );
  const matched = matchSitesToFeatures(sites, data.items).sites;
  if (sites.length !== rows.length || matched.some((s) => !s.matchedFeature))
    throw new Error("Workbook validation failed: missing or unmatched sites");
  const outDir = resolve("../../artifacts/fiber-inventory");
  mkdirSync(outDir, { recursive: true });
  const output = resolve(outDir, "fiber-demo-sites-3000.xlsx");
  writeFileSync(output, bytes);
  console.log(
    JSON.stringify(
      {
        output,
        sites: sites.length,
        matched: matched.filter((s) => s.matchedFeature).length,
        uniqueCoordinates: seen.size,
        sources: [...new Set(rows.map((r) => r["Source KMZ"]))],
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message.replace(/postgres(?:ql)?:\/\/\S+/g, "[redacted]")
      : "Generation failed",
  );
  process.exitCode = 1;
} finally {
  await client.end();
}
