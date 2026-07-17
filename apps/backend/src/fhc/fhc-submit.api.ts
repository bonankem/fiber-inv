import { bad, Err, mustHave } from "schema/errors";
import { type FhcSubmitT, fhcSubmitZ, ftthConnectionS } from "schema/fhc";
import type { UserFullT } from "schema/people";
import { workFullP } from "schema/work";
import { prisma, WorkAction, WorkStatus } from "#/db";
import { maybeConnect, maybeIdOrKey } from "#/utils/ids";
import { postRoute } from "#/utils/routing";
import { updateWork } from "#/utils/work";

export const fhcUpdateApi = postRoute({
  url: "/fhc/submit",
  schema: fhcSubmitZ,
  handler: (req) => fhcSubmit(req.body, req.authUser),
});

async function fhcSubmit(dto: FhcSubmitT, from: UserFullT) {
  const fhc = await prisma.ftthConnection.findUnique({
    where: { id: dto.id },
    include: { work: workFullP },
  });
  if (!fhc) bad(Err.NOT_FOUND);

  mustHave(dto.fatId || fhc.fatId, "fatId");
  //mustHave(dto.oltId || fhc.oltId, "oltId");

  return prisma.ftthConnection.update({
    select: ftthConnectionS,
    where: { id: dto.id },
    data: {
      olt: maybeConnect(dto.oltId),
      fat: maybeConnect(dto.fatId),
      ontSerial: dto.ontSerial,
      ontOem: maybeIdOrKey(dto.ontOem),
      oltPort: dto.oltPort || undefined,
      fatPort: dto.fatPort || undefined,
      cableLength: dto.cableLength || undefined,
      work: updateWork({
        status: WorkStatus.REVIEW,
        action: WorkAction.SUBMIT_REPORT,
        old: fhc.work,
        dto,
        from,
      }),
    },
  });
}
