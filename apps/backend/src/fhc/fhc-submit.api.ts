import { bad, Err } from "schema/errors";
import {
  type FhcSubmitT,
  fhcImageTypes,
  fhcSubmitZ,
  ftthConnectionS,
} from "schema/fhc";
import type { UserFullT } from "schema/people";
import { workFullP } from "schema/work";
import { type Prisma, prisma, WorkAction, WorkStatus } from "#/db";
import { maybeConnect, maybeIdOrKey } from "#/utils/ids";
import { postRoute } from "#/utils/routing";
import { updateWork } from "#/utils/work";

export const fhcUpdateApi = postRoute({
  url: "/fhc/submit",
  schema: fhcSubmitZ,
  handler: (req) => fhcSubmit(req.body, req.authUser),
});
const db = prisma.ftthConnection;

async function fhcSubmit(dto: FhcSubmitT, from: UserFullT) {
  const fhc = await prisma.ftthConnection.findUnique({
    where: { id: dto.id },
    include: { work: workFullP },
  });
  if (!fhc) bad(Err.NOT_FOUND);

  const { id, fatId, fatPort, ontSerial } = dto;
  await mustNotExist(id, "FAT port", { fatUniq: { fatId, fatPort } });
  await mustNotExist(id, "ONT serial", { ontSerial });

  for (const key of fhcImageTypes) {
    const required = key === "FHC_POLE" ? dto.newPole : true;
    if (required && !dto.images[key]) bad(Err.FIELD_REQUIRED, key);
  }

  return prisma.ftthConnection.update({
    select: ftthConnectionS,
    where: { id: dto.id },
    data: {
      olt: maybeConnect(dto.oltId),
      fat: maybeConnect(dto.fatId),
      ontOem: maybeIdOrKey(dto.ontOem),
      ontSerial: dto.ontSerial,
      fatPort: dto.fatPort,
      oltPort: dto.oltPort || undefined,
      cableLength: dto.cableLength,
      newPole: dto.newPole,
      work: updateWork({
        status: WorkStatus.REVIEW,
        action: WorkAction.SUBMIT_REPORT,
        old: fhc.work,
        dto,
        from,
        docs: dto.images,
      }),
    },
  });
}

type Where = Prisma.FtthConnectionWhereUniqueInput;

async function mustNotExist(id: string, param: string, where: Where) {
  const found = await db.findUnique({ where, select: { id: true } });
  if (found && found.id !== id) bad(Err.ALREADY_ASSIGNED, param);
}
