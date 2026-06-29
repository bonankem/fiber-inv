import XLSX from "@e965/xlsx";
import type { MultipartFile } from "@fastify/multipart";
import { PDFParse } from "pdf-parse";
import { dropWhile } from "remeda";
import { bad, Err } from "schema/errors";
import type { CoordsT } from "schema/geo";
import type { Maybe } from "schema/utils";
import { prisma } from "#/db";
import { isInsideRing } from "#/geo/utils";
import { makeKeySpaced, parseCoords } from "#/utils/queries";
import { appRoute } from "#/utils/routing";

export const fhcExtractApi = appRoute({
  url: "/fhc/extract",
  method: "POST",
  handler: (req) => req.file().then((f) => extract(f)),
});

async function extract(file: Maybe<MultipartFile>) {
  if (!file) bad(Err.FILE_REQUIRED);
  if (/sheet|excel|csv/.test(file.mimetype)) {
    return extractExcel(file);
  }
  if (/pdf/.test(file.mimetype)) {
    return extractPdf(file);
  }
  bad(Err.INVALID_FILE);
}
async function extractPdf(file: MultipartFile) {
  const data = await file.toBuffer();
  const pdf = new PDFParse({ data });
  const { text } = await pdf.getText();

  const lines = text
    .split(/\n/g)
    .map((l) => l.split(" : ", 2))
    .filter((l) => l.length === 2);

  return lines;
}
async function extractExcel(file: MultipartFile) {
  const book = XLSX.read(await file.toBuffer());
  const sheet = book.Sheets[book.SheetNames[0]];
  const parsed = XLSX.utils.sheet_to_json(sheet, {
    blankrows: false,
    skipHidden: true,
    header: "A",
  }) as Record<string, string>[];

  const data = dropWhile(parsed, (row) => Object.keys(row).length < 3);
  if (data.length < 2) return data;

  const [head, ...rows] = data;
  const keys = Object.keys(head);
  const vals = Object.values(head).map(makeKeySpaced);
  const keyLike = (r: RegExp) => keys[vals.findIndex((v) => r.test(v))];

  const tnKey = keyLike(/\b(tn)\b/);
  const nameKey = keyLike(/\b(nom|name)\b/);
  const contactKey = keyLike(/\b(contact)\b/);
  const coordsKey = keyLike(/\b(coord)/);

  if (!tnKey) bad(Err.MISSING_COLUMN, "tn");
  if (!nameKey) bad(Err.MISSING_COLUMN, "name");
  if (!contactKey) bad(Err.MISSING_COLUMN, "contact");
  if (!coordsKey) bad(Err.MISSING_COLUMN, "coords");

  const localities = await prisma.locality.findMany({
    include: { boundary: true },
  });
  const findLocality = (c: Maybe<CoordsT>) => {
    if (!c) return undefined;
    const found = localities.find(
      (l) => l.boundary && isInsideRing(c, l.boundary?.ring),
    );
    return found?.id;
  };

  const clean = (s: Maybe<string>) => s?.replace(/\s+/g, " ")?.trim();
  const items = rows.map((r) => {
    const tn = clean(r[tnKey]?.replace(/@mtn.+/, ""));
    const name = clean(r[nameKey]);
    const phone = clean(r[contactKey]) || null;
    const coords = parseCoords(clean(r[coordsKey]));
    const localityId = findLocality(coords);
    return { tn, name, phone, coords, localityId };
  });

  return items;
}
