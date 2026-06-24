import { type FhcUpdateT, fhcUpdateZ, ftthConnectionS } from "schema/fhc";
import type { UserFullT } from "schema/people";
import { workFullP } from "schema/work";
import { type Prisma, prisma, WorkAction, WorkStatus } from "#/db";
import {
  bad,
  connectIdOrKey,
  maybeConnect,
  notFound,
  postRoute,
} from "#/utils";
import { updateWork } from "#/utils/work";

export const fhcUpdateApi = postRoute(
  "/fhc/update",
  () => fhcUpdateZ,
  (req) => fhcUpdate(req.body, req.authUser),
);

async function fhcUpdate(dto: FhcUpdateT, from: UserFullT) {
  const fhc = await prisma.ftthConnection.findUnique({
    where: { id: dto.id },
    include: { work: workFullP },
  });
  if (!fhc) notFound();

  if (dto.finish) {
    if (!dto.fatId && !fhc.fatId) bad("FAT is required");
    if (!dto.oltId && !fhc.oltId) bad("OLT is required");
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
  if (!model || !ontOem) bad("ONT model and OEM are required");
  const oem = connectIdOrKey(ontOem);
  return {
    upsert: {
      where: { serial },
      create: { serial, model, oem },
      update: { serial, model, oem },
    },
  };
}
