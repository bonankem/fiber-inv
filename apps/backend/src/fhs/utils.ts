import { StaffRole, type WorkStatus } from "schema/enums";
import { bad, Err } from "schema/errors";
import { ftthSurveyS } from "schema/fhs";
import type { Maybe } from "schema/utils";
import type { WorkT } from "schema/work";
import { prisma } from "#/db";

type Findable<T> = {
  findUnique(args: { where: { id: string } }): Promise<T>;
};

function maybeFind<T>(db: Findable<T>, id: Maybe<string>) {
  return id ? db.findUnique({ where: { id } }) : null;
}

export async function fhsCheck(ids: {
  workId: string;
  userId?: string;
  vendorId?: string;
  status?: WorkStatus | WorkStatus[];
  statusError?: Err;
}) {
  const { workId, userId, vendorId, status } = ids;
  const [s, u, v] = await Promise.all([
    prisma.ftthSurvey.findUnique({
      where: { id: workId },
      select: ftthSurveyS,
    }),
    maybeFind(prisma.user, userId),
    maybeFind(prisma.vendor, vendorId),
  ]);
  if (!s) bad(Err.NOT_FOUND, "id");

  if (status) {
    const ws = s.work.status;
    const ok = Array.isArray(status) ? status.includes(ws) : status === ws;
    if (!ok) bad(ids.statusError || Err.STATUS_ALREADY_CHANGED);
  }

  return { s, u, v };
}

export function fhsWorker(
  s: { work: WorkT },
  role = StaffRole.PLANNING_ENGINEER,
) {
  return s.work.workers.find((w) => w.role === role)?.user;
}
