import type { IdNameT } from "schema/common";
import type { CoordsT } from "schema/geo";
import type { WorkUpdateT } from "schema/work";
import type { Prisma, WorkAction, WorkDocType, WorkStatus } from "#/db";
import { currentTime, type Falsey, type Maybe, maybeConnect } from "#/utils";

export async function nextId(
  tx: Prisma.TransactionClient,
  pre: "FHS" | "FHP" | "FHC",
) {
  const now = currentTime();
  const prefix = `${pre}-${now.format("YYYYMMDD")}-`;
  const requestDate = now.format("YYYY-MM-DD");

  const last = await tx.work.findFirst({
    where: { sid: { startsWith: prefix } },
    orderBy: [{ createdAt: "desc" }, { sid: "desc" }],
    select: { sid: true },
  });

  const prev = Number(last?.sid?.slice(prefix.length)) || 0;
  const next = (prev + 1).toString().padStart(4, "0");
  const sid = `${prefix}${next}`;
  return { sid, requestDate };
}

export function maybeCoords(
  latitude: unknown,
  longitude: unknown,
): CoordsT | null {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat)) return null;
  if (Number.isNaN(lng)) return null;
  return { lat, lng };
}

const TEN_5 = 100000;

export function to5dp(n: number | string) {
  return Math.round(Number(n) * TEN_5) / TEN_5;
}

function intString(n: number, width: number) {
  const i = Math.abs(Math.round(n * TEN_5));
  return i.toString().padStart(width, "0");
}

/**
 * Creates an integer ID that fits within Number.MAX_SAFE_INTEGER
 * but still visually resembles the coordinates it represents e.g.
 * `coordsId(6.15472, -5.96691) === 4061547200596691`.
 */
export function getLatLngId(lat: number, lng: number) {
  const latI = intString(lat, 7);
  const lngI = intString(lng, 8);
  const sign = (lat >= 0 ? 0 : 1) + (lng >= 0 ? 1 : 3);
  // 1:+lat,+lng 2:-lat,+lng 3:+lat,-lng; 4:-lat,-lng
  return Number(`${sign}${latI}${lngI}`);
}

export function getCoordsId(c: CoordsT) {
  return getLatLngId(c.lat, c.lng);
}

export function createCoords(c: CoordsT) {
  const lat = to5dp(c.lat);
  const lng = to5dp(c.lng);
  return { id: getLatLngId(lat, lng), lat, lng };
}

export function createManyCoords(cs: Maybe<CoordsT>[]) {
  return filterTruthy(cs).map(createCoords);
}

export function setCoords(
  src: Maybe<{ lat: Maybe<number>; lng: Maybe<number> }>,
): Prisma.CoordsCreateNestedOneWithoutWorksInput | undefined {
  if (!src?.lat || !src?.lng) return undefined;
  const { lat, lng } = src;
  const create = createCoords({ lat, lng });
  const id = create.id;
  return { connectOrCreate: { where: { id }, create } };
}

export function addUploads(ids: Maybe<string[]>) {
  if (!ids?.length) return undefined;
  return { connect: ids.map((id) => ({ id })) };
}

export function create<T>(data: T) {
  return { create: data };
}

export function update<T>(data: T) {
  return { update: data };
}

export type HasName = string | { name: string };

export function addLog(
  body: Omit<WorkUpdateT, "id">,
  action: WorkAction,
  from: Maybe<IdNameT>,
  status: Maybe<WorkStatus> = undefined,
  to: Falsey<HasName>[] = [],
): Prisma.WorkLogCreateNestedManyWithoutWorkInput {
  const toNames = filterTruthy(to).map((t) => {
    return typeof t === "string" ? t : t.name;
  });
  return create({
    action,
    newStatus: status || null,
    fromUser: maybeConnect(from),
    comment: body.comment,
    uploads: addUploads(body.uploads),
    toNames,
  });
}

export function setDocsFrom<T extends WorkDocType>(
  body: Record<T, Maybe<string>>,
  ...types: T[]
): Prisma.WorkDocCreateNestedManyWithoutWorkInput | undefined {
  const inputs: Prisma.WorkDocCreateWithoutWorkInput[] = [];
  for (const type of types) {
    const upload = maybeConnect(body[type]);
    if (upload) inputs.push({ type, upload });
  }
  return inputs.length ? { create: inputs } : undefined;
}

export function updateDocs<T extends WorkDocType>(
  workId: string,
  docs: Record<T, Maybe<string | { key: string; uploadId: string }>>,
) {
  const keys = Object.keys(docs) as T[];
  const toDelete = keys.filter((k) => docs[k] === "remove");
  const toUpdate = keys.filter((k) => docs[k] && docs[k] !== "remove");
  return {
    deleteMany: { workId, type: { in: toDelete } },
    upsert: toUpdate.map((type) => {
      // biome-ignore lint/style/noNonNullAssertion: already confirmed to be non-null
      const value = docs[type]!;
      const uploadId = typeof value === "string" ? value : value.uploadId;
      const key = typeof value === "string" ? "" : value.key;
      return {
        where: { uniq: { workId, type, key } },
        create: { uploadId, type },
        update: { uploadId },
      };
    }),
  } satisfies Prisma.WorkUpdateInput["docs"];
}

export function qStartsWith(s: Maybe<string>) {
  if (!s) return undefined;
  return { startsWith: s, mode: "insensitive" } satisfies Prisma.StringFilter;
}

export function qContains(s: Maybe<string>) {
  if (!s) return undefined;
  return { contains: s, mode: "insensitive" } satisfies Prisma.StringFilter;
}

export function qWorkerIs(userId: Maybe<string>) {
  if (!userId) return undefined;
  return { some: { userId } } satisfies Prisma.WorkerListRelationFilter;
}

export function qSidIs(sid: Maybe<string>) {
  if (!sid) return undefined;

  // complete sid match
  if (/^[A-Z]+-\d+-\d{4}/.test(sid)) return sid;

  // partial sid match
  return qContains(sid);
}

export function makeKey(text: string) {
  const norm = text.normalize("NFKD");
  return norm.toLowerCase().replace(/[\W_]+/g, "");
}

export function filterNotNull<T>(list: Maybe<T>[]) {
  return list.filter((t) => t !== null && t !== undefined) as T[];
}

export function filterTruthy<T>(list: Falsey<T>[]) {
  return list.filter((t) => t) as T[];
}

export function qOr<T>(list: Falsey<T>[]) {
  const actual = filterTruthy(list);
  const n = actual.length;
  if (n === 0) return undefined;
  if (n === 1) return actual[0];
  return { OR: actual };
}

export function qAnd<T>(list: Falsey<T>[]) {
  const actual = filterTruthy(list);
  const n = actual.length;
  if (n === 0) return undefined;
  if (n === 1) return actual[0];
  return { AND: actual };
}
