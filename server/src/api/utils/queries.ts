import type { WorkUpdateT } from "schema/work";
import type { Prisma, WorkAction, WorkDocType, WorkStatus } from "#/prisma";
import type { StringFilter } from "#/prisma/generated/commonInputTypes";
import type { WorkUpdateInput } from "#/prisma/generated/models";
import { currentTime, type Falsey, type Maybe, maybeConnect } from "#/utils";

export async function nextId(tx: Prisma.TransactionClient, pre: string) {
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

export function coordsId(lat: number, lng: number) {
  const latI = Math.round(lat * 100000) + 90;
  const lngI = Math.round(lng * 100000) + 180;
  return lngI * 1000_00000 + latI;
}

export function setCoords(
  src: Maybe<{ lat: Maybe<number>; lng: Maybe<number> }>,
): Prisma.CoordsCreateNestedOneWithoutWorksInput | undefined {
  if (!src?.lat || !src?.lng) return undefined;
  const lat = Math.round(src.lat * 100000) / 100000;
  const lng = Math.round(src.lng * 100000) / 100000;
  const id = coordsId(src.lat, src.lng);
  return { connectOrCreate: { where: { id }, create: { id, lat, lng } } };
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
  status: Maybe<WorkStatus> = undefined,
  to: Falsey<HasName>[] = [],
): Prisma.WorkLogCreateNestedManyWithoutWorkInput {
  const toNames = filterTruthy(to).map((t) => {
    return typeof t === "string" ? t : t.name;
  });
  return create({
    action,
    newStatus: status || null,
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
  } satisfies WorkUpdateInput["docs"];
}

export function qStartsWith(s: Maybe<string>) {
  if (!s) return undefined;
  return { startsWith: s, mode: "insensitive" } satisfies StringFilter;
}

export function qContains(s: Maybe<string>) {
  if (!s) return undefined;
  return { contains: s, mode: "insensitive" } satisfies StringFilter;
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
