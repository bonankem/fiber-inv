import { WorkAction, WorkStatus } from "schema/enums";
import { bad, Err } from "schema/errors";
import { ftthConnectionS } from "schema/fhc";
import type { UserT } from "schema/people";
import { type WorkUpdateT, workFullP, workUpdateZ } from "schema/work";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";

export const fhcAtpFailApi = postRoute({
  url: "/fhc/atp-fail",
  schema: workUpdateZ,
  handler: (req) => fhcAtpFail(req.body, req.authUser),
});

async function fhcAtpFail(dto: WorkUpdateT, from: UserT) {
  const fhc = await prisma.ftthConnection.findUnique({
    where: { id: dto.id },
    include: { work: workFullP },
  });
  if (!fhc) bad(Err.NOT_FOUND);
  if (fhc.work.status !== WorkStatus.FIELD_ATP) bad(Err.STATUS_ALREADY_CHANGED);

  return prisma.ftthConnection.update({
    select: ftthConnectionS,
    where: { id: dto.id },
    data: {
      work: updateWork({
        dto,
        work: fhc.work,
        status: WorkStatus.FAILED_FIELD_ATP,
        action: WorkAction.FAIL_FIELD_ATP,
        logTo: fhc.work?.vendor,
        sender: from,
      }),
    },
  });
}
