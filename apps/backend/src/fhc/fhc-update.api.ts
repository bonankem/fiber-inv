import { bad, Err, mustHave } from "schema/errors";
import { type FhcUpdateT, fhcUpdateZ, ftthConnectionS } from "schema/fhc";
import type { UserFullT } from "schema/people";
import { workFullP } from "schema/work";
import { type Prisma, prisma, WorkAction, WorkStatus } from "#/db";
import { connectIdOrKey, maybeConnect } from "#/utils/ids";
import { postRoute } from "#/utils/routing";
import { updateWork } from "#/utils/work";

export const fhcUpdateApi = postRoute({
  url: "/fhc/update",
  schema: fhcUpdateZ,
  handler: (req) => fhcUpdate(req.body, req.authUser),
});

async function fhcUpdate(dto: FhcUpdateT, from: UserFullT) {
  const fhc = await prisma.ftthConnection.findUnique({
    where: { id: dto.id },
    include: { work: workFullP },
  });
  if (!fhc) bad(Err.NOT_FOUND);

  if (dto.finish) {
    mustHave(dto.fatId || fhc.fatId, "fatId");
    mustHave(dto.oltId || fhc.oltId, "oltId");
  }

  const { ONGOING, REVIEW } = WorkStatus;
  return prisma.ftthConnection.update({
    select: ftthConnectionS,
    where: { id: dto.id },
    data: {
      olt: maybeConnect(dto.oltId),
      fat: maybeConnect(dto.fatId),
      ont: ontUpdate(dto),
      oltPort: dto.oltPort || undefined,
      fatPort: dto.fatPort || undefined,
      cableLength: dto.cableLength || undefined,
      work: updateWork({
        status: dto.finish ? REVIEW : ONGOING,
        action: WorkAction.UPDATE,
        old: fhc.work,
        dto,
        from,
      }),
    },
  });
}

function ontUpdate(dto: FhcUpdateT): Prisma.FtthConnectionUpdateInput["ont"] {
  const { ontSerial: serial, ontModel: model, ontOem } = dto;
  if (!serial) return undefined;
  mustHave(model, "ontModel");
  mustHave(ontOem, "ontOem");

  const oem = connectIdOrKey(ontOem);
  return {
    upsert: {
      where: { serial },
      create: { serial, model, oem },
      update: { serial, model, oem },
    },
  };
}
