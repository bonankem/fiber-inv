import { WorkAction, WorkStatus } from "schema/enums";
import { bad, Err } from "schema/errors";
import { ftthConnectionS } from "schema/fhc";
import type { UserT } from "schema/people";
import { type WorkUpdateT, workFullP, workUpdateZ } from "schema/work";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";

export const fhcAtpPassApi = postRoute({
  url: "/fhc/atp-pass",
  schema: workUpdateZ,
  handler: (req) => fhcAtpPass(req.body, req.authUser),
});

async function fhcAtpPass(dto: WorkUpdateT, from: UserT) {
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
        old: fhc.work,
        status: WorkStatus.CLOSED,
        action: WorkAction.PASS_FIELD_ATP,
        logTo: fhc.work?.vendor,
        from,
      }),
    },
  });
}
