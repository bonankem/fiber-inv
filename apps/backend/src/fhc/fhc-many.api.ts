import { randomUUID } from "node:crypto";
import { uniqueBy } from "remeda";
import { type FhcRequestManyT, fhcRequestManyZ } from "schema/fhc";
import type { UserFullT } from "schema/people";
import { prisma, WorkAction, WorkStatus } from "#/db";
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

  return { success: true };
}
