import { type FhcRequestT, fhcRequestZ, ftthConnectionS } from "schema/fhc";
import type { UserFullT } from "schema/people";
import { prisma, StaffRole, WorkAction, WorkStatus } from "#/db";
import { sendMail, toMtn, toVendor } from "#/mail/send";
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

  const result = await prisma.$transaction(async (tx) => {
    const { sid, requestDate } = await nextId(tx, "FHC");
    return tx.ftthConnection.create({
      select: ftthConnectionS,
      data: {
        tn: dto.tn,
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

  const vendor = result.work.vendor;
  sendMail({
    to: [toMtn(StaffRole.HOME_INTERNET), toVendor(vendor)],
    subject: `Nouvelle demande HC: ${dto.tn}`,
    body: [`Une nouvelle demande HC a été soumise à ${vendor?.name}`],
    button: "/ftth-connections",
    fields: [
      ["TN", result.tn],
      ["Nom", result.work.name],
      ["Localité", result.work.locality?.name],
    ],
  });
  return result;
}
