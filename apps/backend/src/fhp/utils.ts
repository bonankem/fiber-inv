import type { WorkStatus } from "schema/enums";
import { ftthProjectS } from "schema/fhp";
import type { WorkT } from "schema/work";
import { prisma, StaffRole } from "#/db";
import { bad, type Maybe, notFound } from "#/utils";

type Findable<T> = {
  findUnique(args: { where: { id: string } }): Promise<T>;
};

function maybeFind<T>(db: Findable<T>, id: Maybe<string>) {
  return id ? db.findUnique({ where: { id } }) : null;
}

export function fhpWorker(
  s: { work: WorkT },
  role = StaffRole.PROJECT_ENGINEER,
) {
  return s.work.workers.find((w) => w.role === role)?.user;
}

export async function fhpCheck(ids: {
  workId: string;
  userId?: string;
  vendorId?: string;
  status?: WorkStatus | WorkStatus[];
  statusError?: string;
}) {
  const { workId, userId, vendorId, status } = ids;
  const [s, u, v] = await Promise.all([
    prisma.ftthProject.findUnique({
      where: { id: workId },
      select: ftthProjectS,
    }),
    maybeFind(prisma.user, userId),
    maybeFind(prisma.vendor, vendorId),
  ]);
  if (!s) notFound("Project not found");

  if (status) {
    const ws = s.work.status;
    const ok = Array.isArray(status) ? status.includes(ws) : status === ws;
    if (!ok) bad(ids.statusError || "Cannot perform this action at this stage");
  }

  return { s, u, v };
}
