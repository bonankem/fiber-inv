import { WorkAction, WorkStatus } from "schema/enums";
import { bad, Err } from "schema/errors";
import {
  type FhcStatusT,
  fhcNextPhases,
  fhcStatusZ,
  ftthConnectionS,
} from "schema/fhc";
import type { UserT } from "schema/people";
import { workFullP } from "schema/work";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";

export const fhcStatusApi = postRoute({
  url: "/fhc/status",
  schema: fhcStatusZ,
  handler: (req) => fhcStatus(req.body, req.authUser),
});

const fromStatus: WorkStatus[] = fhcNextPhases.filter(
  (s) => s !== WorkStatus.INSTALLATION,
);

async function fhcStatus(dto: FhcStatusT, from: UserT) {
  const db = prisma.ftthConnection;
  const fhc = await db.findUnique({
    where: { id: dto.id },
    include: { work: workFullP },
  });
  if (!fhc) bad(Err.NOT_FOUND);
  const status = fhc.work.status;
  if (status === dto.nextPhase) bad(Err.STATUS_ALREADY_CHANGED);
  if (!fromStatus.includes(status)) bad(Err.STATUS_ALREADY_CHANGED);

  return db.update({
    select: ftthConnectionS,
    where: { id: dto.id },
    data: {
      work: updateWork({
        dto,
        old: fhc.work,
        status: dto.nextPhase,
        action: WorkAction.UPDATE_STATUS,
        from,
      }),
    },
  });
}
