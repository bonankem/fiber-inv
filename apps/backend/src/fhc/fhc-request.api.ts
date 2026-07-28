import { type FhcRequestT, fhcRequestZ, ftthConnectionS } from "schema/fhc";
import type { UserFullT } from "schema/people";
import { prisma, WorkAction, WorkStatus } from "#/db";
import { connectId, maybeIdOrKey } from "#/utils/ids";
import { addLog, create, makeKey, nextId, setCoords } from "#/utils/queries";
import { postRoute } from "#/utils/routing";

export const fhcRequestApi = postRoute({
  url: "/fhc",
  schema: fhcRequestZ,
  handler: (req) => fhcRequest(req.body, req.authUser),
});

async function fhcRequest(dto: FhcRequestT, from: UserFullT) {
  const status = WorkStatus.SURVEY;
  const action = WorkAction.REQUEST;

  return prisma.$transaction(async (tx) => {
    const { sid, requestDate } = await nextId(tx, "FHC");
    return tx.ftthConnection.create({
      select: ftthConnectionS,
      data: {
        tn: dto.tn,
        address: dto.address,
        email: dto.email,
        phone: dto.phone,
        ontSerial: dto.ontSerial,
        ontOem: maybeIdOrKey(dto.ontOem),
        work: create({
          sid,
          status,
          requestDate,
          name: dto.name,
          key: makeKey(dto.name),
          startDate: dto.startDate,
          locality: connectId(dto.localityId),
          coords: setCoords(dto.coords),
          vendor: connectId(dto.vendorId),
          logs: addLog(dto, action, from, status),
        }),
      },
    });
  });
}
