import XLSX from "@e965/xlsx";
import type { MultipartFile } from "@fastify/multipart";
import { bad, Err, mustHave } from "schema/errors";
import type { FiberInventoryT } from "schema/fiber-inventory";
import {
  FIBER_SITE_REQUIRED_HEADERS,
  fiberInventoryZ,
  fiberKmzFeatureZ,
  fiberSiteSourceZ,
  matchSitesToFeatures,
  parseFiberSiteSheets,
} from "schema/fiber-inventory";
import type { Maybe } from "schema/utils";
import { Allow } from "#/auth/guard";
import { type Prisma, prisma } from "#/db";
import { parseSimpleKmz } from "#/uploads/parsers/kmz";
import { appRoute, getRoute, rbac } from "#/utils/routing";

const KMZ_TYPE = "FIBER_INVENTORY_KMZ";
const SITES_TYPE = "FIBER_INVENTORY_SITES";
const uploadTypes = [KMZ_TYPE, SITES_TYPE];

export const fiberInventoryGetApi = getRoute({
  url: "/fiber-inventory",
  handler: loadInventory,
});

export const fiberInventoryUploadApi = appRoute({
  url: "/fiber-inventory/upload",
  method: "POST",
  onRequest: rbac(Allow.STAFF),
  schema: { response: { 200: fiberInventoryZ } },
  handler: (req) => req.file().then(uploadInventoryFile),
});

async function uploadInventoryFile(file: Maybe<MultipartFile>) {
  mustHave(file, Err.FILE_REQUIRED);
  const name = file.filename;
  const data = await file.toBuffer();
  const extension = /\.([^.]+)$/.exec(name)?.[1]?.toLowerCase();

  if (extension === "kmz" || extension === "kml") {
    const parsed = await parseSimpleKmz(data);
    if (!parsed?.length) {
      bad(
        Err.INVALID_FILE,
        `No placemarks (points, lines or polygons) found in ${name}`,
      );
    }
    const items = parsed.map(({ name, geom, kind }) => ({ name, geom, kind }));
    await saveSource(name, KMZ_TYPE, data, items);
  } else if (["xlsx", "xls", "csv"].includes(extension || "")) {
    const sites = parseSites(data);
    if (!sites.length) {
      bad(
        Err.INVALID_FILE,
        `No valid sites in ${name}. Expected columns: ${FIBER_SITE_REQUIRED_HEADERS}`,
      );
    }
    await saveSource(name, SITES_TYPE, data, sites);
  } else {
    bad(Err.INVALID_FILE, "Supported formats: .kmz, .kml, .xlsx, .xls, .csv");
  }

  return loadInventory();
}

async function saveSource(
  name: string,
  type: string,
  data: Buffer,
  parsed: unknown,
) {
  await prisma.upload.create({
    data: {
      name,
      type,
      size: data.byteLength,
      parsed: parsed as any,
      inDb: { create: { data: new Uint8Array(data) } },
    },
  });
}

async function loadInventory(): Promise<FiberInventoryT> {
  const uploads = await prisma.upload.findMany({
    where: { type: { in: uploadTypes } },
    orderBy: { sentAt: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      parsed: true,
      inDb: { select: { data: true } },
    },
  });

  const features = uploads
    .filter((up) => up.type === KMZ_TYPE)
    .flatMap((up) => parseKmzFeatures(up.parsed));
  const sourceSites = (
    await Promise.all(
      uploads
        .filter((up) => up.type === SITES_TYPE)
        .map((up) =>
          up.inDb
            ? parseStoredSites(Buffer.from(up.inDb.data), up.parsed)
            : parseSiteRows(up.parsed),
        ),
    )
  ).flat();

  const { sites, siteIndexesByItem } = matchSitesToFeatures(
    sourceSites,
    features,
  );
  const items = features.map((feature, i) => ({
    ...feature,
    sites: siteIndexesByItem[i].map((siteIndex) => sites[siteIndex]),
  }));

  return fiberInventoryZ.parse({
    uploads: uploads.map((up) => ({
      id: up.id,
      name: up.name,
      kind: up.type === KMZ_TYPE ? "kmz" : "spreadsheet",
    })),
    items,
    sites,
  });
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
    const parsed = fiberKmzFeatureZ.safeParse({
      name: row.name,
      geom,
      kind,
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
