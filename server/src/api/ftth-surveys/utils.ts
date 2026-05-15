import { StaffRole, type WorkStatus } from "schema/enums";
import { type FtthSurveyT, ftthSurveyS } from "schema/fhs";
import { prisma } from "#/prisma";
import { bad, type Maybe, notFound } from "#/utils";

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
  statusError?: string;
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
  if (!s) notFound("Survey not found");

  if (status) {
    const ws = s.work.status;
    const ok = Array.isArray(status) ? status.includes(ws) : status === ws;
    if (!ok) bad(ids.statusError || "Cannot perform this action at this stage");
  }

  return { s, u, v };
}

export function fhsWorker(s: FtthSurveyT, role = StaffRole.PLANNING_ENGINEER) {
  return s.work.workers.find((w) => w.role === role)?.user;
}
