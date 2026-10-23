import { randomUUID } from "node:crypto";
import { groupBy, uniqueBy } from "remeda";
import { type FhcRequestManyT, fhcRequestManyZ } from "schema/fhc";
import type { UserFullT } from "schema/people";
import { workP } from "schema/work";
import { prisma, StaffRole, WorkAction, WorkStatus } from "#/db";
import { sendMail, toMtn, toVendor } from "#/mail/send";
import { createCoords, getCoordsId, makeKey, nextIds } from "#/utils/queries";
import { postRoute } from "#/utils/routing";

export const fhcRequestManyApi = postRoute({
  url: "/fhc/many",
  schema: fhcRequestManyZ,
  handler: (req) => fhcRequestMany(req.body, req.authUser),
});

async function fhcRequestMany({ items }: FhcRequestManyT, from: UserFullT) {
  const status = WorkStatus.SURVEY;
  const action = WorkAction.REQUEST;

  const uuids = items.map(() => randomUUID());

  await prisma.$transaction(async (tx) => {
    const { ids: sids, requestDate } = await nextIds(tx, "FHC", items.length);

    const addCoords = tx.coords.createMany({
      data: uniqueBy(
        items.map((i) => createCoords(i.coords)),
        (c) => c.id,
      ),
      skipDuplicates: true,
    });
    const addWork = tx.work.createMany({
      data: items.map((dto, i) => ({
        sid: sids[i],
        id: uuids[i],
        status,
        requestDate,
        name: dto.name,
        key: makeKey(dto.name),
        startDate: dto.startDate,
        localityId: dto.localityId,
        vendorId: dto.vendorId,
        coordsId: getCoordsId(dto.coords),
      })),
    });
    const addFhc = tx.ftthConnection.createMany({
      data: items.map((dto, i) => ({
        id: uuids[i],
        tn: dto.tn,
        email: dto.email,
        phone: dto.phone,
      })),
    });
    const addLogs = tx.workLog.createMany({
      data: uuids.map((workId) => ({
        workId,
        action,
        newStatus: status,
        fromUserId: from?.id,
      })),
    });
    await Promise.all([addCoords, addWork, addFhc, addLogs]);
  });

  const done = await prisma.ftthConnection.findMany({
    where: { tn: { in: items.map((i) => i.tn) } },
    select: { tn: true, work: workP },
  });

  const byVendor = Object.values(groupBy(done, (r) => r.work.vendor?.id));

  byVendor.map((jobs) => {
    const n = jobs.length;
    const vendor = jobs[0].work.vendor;
    return sendMail({
      to: [toMtn(StaffRole.HOME_INTERNET), toVendor(vendor?.id)],
      subject: `Nouvelles demandes HC`,
      body: [`${n} demandes HC ont été envoyées à ${vendor?.name}.`],
      fields: jobs.map((j) => [
        j.tn,
        `${j.work.name} (${j.work.locality?.name ?? "-"})`,
      ]),
      button: "/ftth-connections",
    });
  });

  return { success: true };
}
