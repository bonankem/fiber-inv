/** biome-ignore-all lint/suspicious/noExplicitAny: Prisma Json columns take untyped values */
import { createHash } from "node:crypto";
import XLSX from "@e965/xlsx";
import type { MultipartFile } from "@fastify/multipart";
import { bad, Err, mustHave } from "schema/errors";
import {
  assignLayers,
  classifyKmzFeature,
  countLayers,
  FIBER_SITE_REQUIRED_HEADERS,
  type FiberInventoryT,
  type FiberLayerT,
  fiberInventoryZ,
  fiberKmzFeatureZ,
  fiberSiteSourceZ,
  fiberSourceIdZ,
  fiberSourceLayersZ,
  fiberSourceVisibleZ,
  fiberUploadOptionsZ,
  matchSitesToFeatures,
  parseFiberSiteSheets,
  simplifyLine,
} from "schema/fiber-inventory";
import type { Maybe } from "schema/utils";
import { Allow } from "#/auth/guard";
import { prisma } from "#/db";
import { appRoute, getRoute, postRoute, rbac } from "#/utils/routing";
import { parseFiberKmz } from "./fiber-kmz";

const KMZ_TYPE = "FIBER_INVENTORY_KMZ";
const SITES_TYPE = "FIBER_INVENTORY_SITES";
const uploadTypes = [KMZ_TYPE, SITES_TYPE];
const SNAPSHOT_ID = "current";

/** Vertices closer than this to a line are dropped (CAD exports are dense) */
const SIMPLIFY_M = 1;

// ---- routes -----------------------------------------------------------------

export const fiberInventoryGetApi = getRoute({
  url: "/fiber-inventory",
  handler: loadInventory,
});

export const fiberInventoryUploadApi = appRoute({
  url: "/fiber-inventory/upload",
  method: "POST",
  onRequest: rbac(Allow.STAFF),
  handler: (req) => req.file().then(uploadInventoryFile),
});

export const fiberSourceVisibleApi = postRoute({
  url: "/fiber-inventory/sources/visible",
  schema: fiberSourceVisibleZ,
  allow: Allow.STAFF,
  handler: async ({ body }) => {
    await mustFindSource(body.id);
    await prisma.fiberSource.update({
      where: { id: body.id },
      data: { visible: body.visible },
    });
    return rebuildSnapshot();
  },
});

export const fiberSourceLayersApi = postRoute({
  url: "/fiber-inventory/sources/layers",
  schema: fiberSourceLayersZ,
  allow: Allow.STAFF,
  handler: async ({ body }) => {
    const source = await mustFindSource(body.id);
    if (source.kind !== "kmz")
      bad(Err.INVALID_INPUT, "Only KMZ files have layers");
    const stored = await prisma.uploadInDb.findUnique({
      where: { uploadId: source.uploadId },
    });
    if (!stored) bad(Err.NOT_FOUND, "Stored file");
    const kmz = await buildKmz(Buffer.from(stored.data), body.excludedLayers);
    await prisma.$transaction([
      prisma.upload.update({
        where: { id: source.uploadId },
        data: { parsed: kmz.items as any },
      }),
      prisma.fiberSource.update({
        where: { id: source.id },
        data: {
          count: kmz.items.length,
          layers: kmz.layers,
          excludedLayers: kmz.excluded,
        },
      }),
    ]);
    return rebuildSnapshot();
  },
});

export const fiberSourceDeleteApi = postRoute({
  url: "/fiber-inventory/sources/delete",
  schema: fiberSourceIdZ,
  allow: Allow.STAFF,
  handler: async ({ body }) => {
    const source = await mustFindSource(body.id);
    // the upload owns the file and the source row (cascade)
    await prisma.upload.delete({ where: { id: source.uploadId } });
    return rebuildSnapshot();
  },
});

// ---- upload -------------------------------------------------------------------

async function uploadInventoryFile(file: Maybe<MultipartFile>) {
  mustHave(file, Err.FILE_REQUIRED);
  const name = file.filename;
  const data = await file.toBuffer();
  const extension = /\.([^.]+)$/.exec(name)?.[1]?.toLowerCase();
  const options = readOptions(file);

  const hash = createHash("sha256").update(data).digest("hex");
  const dup = await prisma.fiberSource.findFirst({
    where: { hash },
    select: { upload: { select: { name: true } } },
  });
  if (dup) {
    bad(
      Err.ALREADY_EXISTS,
      `This file is already in the inventory as "${dup.upload.name}"`,
    );
  }

  if (extension === "kmz" || extension === "kml") {
    const kmz = await buildKmz(data, options.excludedLayers);
    if (!kmz.items.length) {
      bad(
        Err.INVALID_FILE,
        kmz.layers.length
          ? "Every layer of this file was left out"
          : `No placemarks (points, lines or polygons) found in ${name}`,
      );
    }
    await saveSource(name, data, {
      kind: "kmz",
      hash,
      parsed: kmz.items,
      count: kmz.items.length,
      layers: kmz.layers,
      excludedLayers: kmz.excluded,
    });
  } else if (["xlsx", "xls", "csv"].includes(extension || "")) {
    const sites = parseSites(data);
    if (!sites.length) {
      bad(
        Err.INVALID_FILE,
        `No valid sites in ${name}. Expected columns: ${FIBER_SITE_REQUIRED_HEADERS}`,
      );
    }
    await saveSource(name, data, {
      kind: "sites",
      hash,
      parsed: sites,
      count: sites.length,
      layers: [],
      excludedLayers: [],
    });
  } else {
    bad(Err.INVALID_FILE, "Supported formats: .kmz, .kml, .xlsx, .xls, .csv");
  }

  return rebuildSnapshot();
}

/** Options come as a JSON form field sent before the file */
function readOptions(file: MultipartFile) {
  const field = file.fields.options;
  const raw =
    field && !Array.isArray(field) && "value" in field ? field.value : null;
  if (typeof raw !== "string" || !raw) return fiberUploadOptionsZ.parse({});
  try {
    return fiberUploadOptionsZ.parse(JSON.parse(raw));
  } catch {
    bad(Err.INVALID_INPUT, "Invalid upload options");
  }
}

type SourceData = {
  kind: "kmz" | "sites";
  hash: string;
  parsed: unknown;
  count: number;
  layers: FiberLayerT[];
  excludedLayers: string[];
};

async function saveSource(name: string, data: Buffer, s: SourceData) {
  await prisma.upload.create({
    data: {
      name,
      type: s.kind === "kmz" ? KMZ_TYPE : SITES_TYPE,
      size: data.byteLength,
      parsed: s.parsed as any,
      inDb: { create: { data: new Uint8Array(data) } },
      fiberSource: {
        create: {
          kind: s.kind,
          hash: s.hash,
          count: s.count,
          layers: s.layers,
          excludedLayers: s.excludedLayers,
        },
      },
    },
  });
}

/** Parses a KMZ into map features, leaving out the excluded layers */
async function buildKmz(data: Buffer, excludedLayers: string[]) {
  const raw = assignLayers(await parseFiberKmz(data));
  const layers = countLayers(raw);
  // only keep names that exist, so a stale preview can't hide new layers
  const known = new Set(layers.map((l) => l.name));
  const excluded = [...new Set(excludedLayers)].filter((l) => known.has(l));
  const skip = new Set(excluded);

  const items = raw
    .filter((f) => !skip.has(f.layer))
    .map((f) => ({
      name: f.name,
      kind: f.kind,
      geom: f.kind === "point" ? f.geom : simplifyLine(f.geom, SIMPLIFY_M),
      layer: f.layer,
      props: f.props,
      ...classifyKmzFeature({ name: f.name, kind: f.kind, path: f.path }),
    }));
  return { items, layers, excluded };
}

// ---- snapshot -------------------------------------------------------------

async function loadInventory(): Promise<FiberInventoryT> {
  const snapshot = await prisma.fiberSnapshot.findUnique({
    where: { id: SNAPSHOT_ID },
  });
  if (snapshot) return snapshot.data as unknown as FiberInventoryT;
  return rebuildSnapshot();
}

/**
 * Recomputes the whole map (features, sites, matches) from the sources and
 * stores it, so the map loads without redoing the matching.
 */
export async function rebuildSnapshot(): Promise<FiberInventoryT> {
  await backfillSources();

  const sources = await prisma.fiberSource.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      uploadId: true,
      kind: true,
      visible: true,
      count: true,
      createdAt: true,
      layers: true,
      excludedLayers: true,
      upload: {
        select: {
          name: true,
          parsed: true,
        },
      },
    },
  });

  const visible = sources.filter((s) => s.visible);
  // Network geometry is already parsed. Only spreadsheets need original bytes
  // for the legacy-compatible site parser; don't load every stored KMZ blob.
  const spreadsheets = await prisma.uploadInDb.findMany({
    where: {
      uploadId: {
        in: visible.filter((s) => s.kind === "sites").map((s) => s.uploadId),
      },
    },
    select: { uploadId: true, data: true },
  });
  const sheetBytes = new Map(spreadsheets.map((s) => [s.uploadId, s.data]));
  const features = visible
    .filter((s) => s.kind === "kmz")
    .flatMap((s) =>
      parseKmzFeatures(s.upload.parsed).map((f) => ({ ...f, sourceId: s.id })),
    );
  const sourceSites = visible
    .filter((s) => s.kind === "sites")
    .flatMap((s) => {
      const bytes = sheetBytes.get(s.uploadId);
      const rows = bytes
        ? parseStoredSites(Buffer.from(bytes), s.upload.parsed)
        : parseSiteRows(s.upload.parsed);
      return rows.map((r) => ({ ...r, sourceId: s.id }));
    });

  const { sites, siteIndexesByItem } = matchSitesToFeatures(
    sourceSites,
    features,
  );
  const items = features.map((feature, i) => ({
    ...feature,
    sites: siteIndexesByItem[i].map((siteIndex) => sites[siteIndex]),
  }));

  const data = fiberInventoryZ.parse({
    uploads: sources.map((s) => ({
      id: s.id,
      name: s.upload.name,
      kind: s.kind === "kmz" ? "kmz" : "spreadsheet",
      visible: s.visible,
      count: s.count,
      createdAt: s.createdAt.toISOString(),
      layers: Array.isArray(s.layers) ? s.layers : [],
      excludedLayers: s.excludedLayers,
    })),
    items,
    sites,
  });

  await prisma.fiberSnapshot.upsert({
    where: { id: SNAPSHOT_ID },
    create: { id: SNAPSHOT_ID, data: data as any },
    update: { data: data as any },
  });
  return data;
}

/**
 * Files uploaded before sources existed get one: re-parsed from the stored
 * file (for layers and attributes), and hidden when they repeat a file.
 */
async function backfillSources() {
  const orphans = await prisma.upload.findMany({
    where: { type: { in: uploadTypes }, fiberSource: null },
    orderBy: { sentAt: "asc" },
    select: {
      id: true,
      type: true,
      parsed: true,
      inDb: { select: { data: true } },
    },
  });

  for (const up of orphans) {
    const bytes = up.inDb ? Buffer.from(up.inDb.data) : null;
    const hash = bytes
      ? createHash("sha256").update(bytes).digest("hex")
      : `legacy-${up.id}`;
    const dup = await prisma.fiberSource.findFirst({ where: { hash } });
    const isKmz = up.type === KMZ_TYPE;

    let parsed = up.parsed;
    let layers: FiberLayerT[] = [];
    let count = Array.isArray(up.parsed) ? up.parsed.length : 0;
    if (isKmz && bytes) {
      try {
        const kmz = await buildKmz(bytes, []);
        parsed = kmz.items as any;
        layers = kmz.layers;
        count = kmz.items.length;
      } catch {
        // keep what was parsed at upload time
      }
    }

    await prisma.upload.update({
      where: { id: up.id },
      data: {
        parsed: parsed as any,
        fiberSource: {
          create: {
            kind: isKmz ? "kmz" : "sites",
            hash,
            count,
            layers,
            excludedLayers: [],
            visible: !dup,
          },
        },
      },
    });
  }
}

// ---- helpers --------------------------------------------------------------

async function mustFindSource(id: string) {
  const source = await prisma.fiberSource.findUnique({ where: { id } });
  if (!source) bad(Err.NOT_FOUND, "Source");
  return source;
}

function parseKmzFeatures(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const row = raw as Record<string, unknown>;
    const geom = row.geom;
    const first = Array.isArray(geom) ? geom[0] : undefined;
    const last = Array.isArray(geom) ? geom[geom.length - 1] : undefined;
    const closedRing =
      !!first &&
      !!last &&
      typeof first === "object" &&
      typeof last === "object" &&
      "lat" in first &&
      "lng" in first &&
      "lat" in last &&
      "lng" in last &&
      first.lat === last.lat &&
      first.lng === last.lng;
    const kind =
      (closedRing && row.kind !== "point" ? "polygon" : row.kind) ||
      (Array.isArray(geom) && geom.length === 1
        ? "point"
        : closedRing
          ? "polygon"
          : "line");
    // uploads saved before manholes were classified have no category
    const cls =
      row.category === "manhole" || row.category === "other"
        ? { category: row.category, status: row.status ?? null }
        : kind === "point" || kind === "line" || kind === "polygon"
          ? classifyKmzFeature({ name: String(row.name ?? ""), kind })
          : {};
    const parsed = fiberKmzFeatureZ.safeParse({
      name: row.name,
      geom,
      kind,
      layer: row.layer,
      props: row.props,
      ...cls,
    });
    return parsed.success ? [parsed.data] : [];
  });
}

function parseSiteRows(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    const parsed = fiberSiteSourceZ.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });
}

function parseSites(data: Buffer) {
  const workbook = XLSX.read(data);
  if (!workbook.SheetNames.length)
    bad(Err.INVALID_FILE, "Spreadsheet has no sheets");
  return parseFiberSiteSheets(
    workbook.SheetNames.map((sheetName) =>
      XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
        header: 1,
        defval: "",
        blankrows: false,
      }),
    ),
  );
}

function parseStoredSites(data: Buffer, parsed: unknown) {
  try {
    return parseSites(data);
  } catch {
    return parseSiteRows(parsed);
  }
}
