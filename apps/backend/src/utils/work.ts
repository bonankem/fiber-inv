import type { IdNameT } from "schema/common";
import type { Falsey, Maybe } from "schema/utils";
import type { WorkT, WorkUpdateT } from "schema/work";
import type {
  Prisma,
  StaffRole,
  WorkAction,
  WorkDocType,
  WorkStatus,
} from "#/db";
import { maybeConnect } from "./ids";
import { addUploads, create, filterTruthy } from "./queries";

export type WorkWhere = Prisma.WorkWhereInput;

export function workIsOnUser(
  status: WorkStatus,
  role: StaffRole,
  userId: string,
): WorkWhere {
  return { status, workers: { some: { userId, role } } };
}

export function workIsOnVendor(
  vendorId: Maybe<string>,
  ...statuses: WorkStatus[]
): WorkWhere | undefined {
  if (!vendorId || !statuses.length) return undefined;
  return { vendorId, status: { in: statuses } };
}

type SetWorkerT = { userId: string; role: StaffRole };

export function setWorkers(
  workId: string,
  entries: Maybe<SetWorkerT[]>,
): Prisma.WorkerUpdateManyWithoutWorkNestedInput | undefined {
  if (!entries?.length) return undefined;

  return {
    upsert: entries.map(({ userId, role }) => ({
      where: { uniq: { workId, role } },
      create: { userId, role },
      update: { userId },
    })),
  };
}

type HasName = string | { name: string };

export function addLog(
  body: Omit<WorkUpdateT, "id">,
  action: WorkAction,
  status: Maybe<WorkStatus> = undefined,
  from: Maybe<IdNameT>,
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
    fromUser: maybeConnect(from),
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

type UpdateDocsQuery = {
  [key in WorkDocType]?: Maybe<string | { key: string; uploadId: string }>;
};

export function updateDocs<T extends WorkDocType>(
  workId: string,
  docs: Maybe<UpdateDocsQuery>,
) {
  if (!docs) return undefined;
  const keys = Object.keys(docs) as T[];
  const toDelete = keys.filter((k) => docs[k] === "remove");
  const toUpdate = keys.filter((k) => docs[k] && docs[k] !== "remove");
  return {
    deleteMany: toDelete.length
      ? { workId, type: { in: toDelete } }
      : undefined,
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

type WorkUpdateQuery = {
  dto: WorkUpdateT;
  old: WorkT;
  from?: Maybe<IdNameT>;
  action: WorkAction;
  status?: WorkStatus;
  logTo?: Maybe<HasName> | Maybe<HasName>[];
  vendor?: string | { id: string };
  workers?: SetWorkerT[];
  docs?: UpdateDocsQuery;
  now?: Date;
  also?: Omit<Prisma.WorkUpdateInput, "status" | "vendor">;
};

export function updateWork(q: WorkUpdateQuery) {
  const now = q.now || new Date();
  const changed = q.status && q.status !== q.old.status;
  const logTo = Array.isArray(q.logTo) ? q.logTo : [q.logTo];
  return {
    update: {
      ...q.also,
      status: (changed && q.status) || undefined,
      statusSince: changed ? now : undefined,
      workers: setWorkers(q.dto.id, q.workers),
      vendor: maybeConnect(q.vendor),
      logs: addLog(q.dto, q.action, q.status, q.from, logTo),
      docs: updateDocs(q.dto.id, q.docs) ?? q.also?.docs,
    } satisfies Prisma.WorkUpdateInput,
  };
}
