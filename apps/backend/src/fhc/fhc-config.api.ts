import { WorkAction, WorkStatus } from "schema/enums";
import { bad, Err } from "schema/errors";
import { type FhcConfigT, fhcConfigZ, ftthConnectionS } from "schema/fhc";
import type { UserT } from "schema/people";
import { workFullP } from "schema/work";
import { prisma } from "#/db";
import { maybeConnect } from "#/utils/ids";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";

export const fhcConfigApi = postRoute({
  url: "/fhc/config",
  schema: fhcConfigZ,
  handler: (req) => fhcConfig(req.body, req.authUser),
});

async function fhcConfig(dto: FhcConfigT, from: UserT) {
  const db = prisma.ftthConnection;
  const fhc = await db.findUnique({
    where: { id: dto.id },
    include: { work: workFullP },
  });
  if (!fhc) bad(Err.NOT_FOUND);

  return db.update({
    select: ftthConnectionS,
    where: { id: dto.id },
    data: {
      olt: maybeConnect(dto.oltId),
      oltSlot: dto.oltSlot,
      oltPort: dto.oltPort,
      work: updateWork({
        dto,
        work: fhc.work,
        status: WorkStatus.FIELD_ATP,
        action: WorkAction.CONFIGURATION,
        sender: from,
      }),
    },
  });
}
