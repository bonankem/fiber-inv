import type { Prisma, WorkAction, WorkDocType, WorkStatus } from "#/prisma";
import type { StringFilter } from "#/prisma/generated/commonInputTypes";
import { currentTime, type Maybe, maybeConnect } from "#/utils";

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
  const { lat, lng } = src;
  const id = coordsId(src.lat, src.lng);
  return { connectOrCreate: { where: { id }, create: { id, lat, lng } } };
}

export function addUploads(ids: Maybe<string[]>) {
  if (!ids?.length) return undefined;
  return { connect: ids.map((id) => ({ id })) };
}

type BasicPost = {
  comment?: string;
  uploads?: string[];
};

export function create<T>(data: T) {
  return { create: data };
}

export function addLog(
  body: BasicPost,
  action: WorkAction,
  status: Maybe<WorkStatus>,
): Prisma.WorkLogCreateNestedManyWithoutWorkInput {
  return create({
    action,
    newStatus: status || null,
    comment: body.comment,
    uploads: addUploads(body.uploads),
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
