import { EmrfStatus } from "schema/enums";
import { bad, Err } from "schema/errors";
import {
  type EmrfCollectT,
  emrfCollectionS,
  emrfCollectZ,
} from "schema/inventory";
import type { UserFullT } from "schema/people";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";
import { emrfAccess } from "./utils";

const S = EmrfStatus;

export const emrfCollectApi = postRoute({
  url: "/inventory/emrf/collect",
  schema: emrfCollectZ,
  handler: (req) => collectEmrf(req.body, req.authUser),
});

async function collectEmrf(dto: EmrfCollectT, user: UserFullT) {
  // the vendor who will use the materials records the collection;
  // admins may record it on their behalf
  if (!user.vendor && !user.isAdmin) bad(Err.ACCESS_DENIED);

  return prisma.$transaction(async (tx) => {
    const emrf = await tx.emrf.findFirst({
      where: { id: dto.id, ...emrfAccess(user) },
      select: {
        status: true,
        orderNumber: true,
        items: { select: { id: true, equipmentId: true, requestedQty: true } },
      },
    });
    if (!emrf) bad(Err.NOT_FOUND);
    if (emrf.status === S.COLLECTED) bad(Err.STATUS_ALREADY_CHANGED);
    if (emrf.status !== S.ORDERED || !emrf.orderNumber) {
      bad(Err.INVALID_INPUT, "The EMRF has not been ordered yet");
    }

    // an EMRF is collected in one go, so every line must be accounted for
    const qtys = new Map(dto.items.map((i) => [i.itemId, i.collectedQty]));
    if (qtys.size !== dto.items.length) bad(Err.DUPLICATE_ENTRY);
    const missing = emrf.items.some((line) => !qtys.has(line.id));
    if (missing || qtys.size !== emrf.items.length) {
      bad(Err.INVALID_INPUT, "Every line of the EMRF must be included");
    }
    for (const line of emrf.items) {
      if ((qtys.get(line.id) ?? 0) > line.requestedQty) {
        bad(Err.INVALID_INPUT, "Cannot collect more than was requested");
      }
    }

    // claim the EMRF first so two submissions can't both go through
    const claimed = await tx.emrf.updateMany({
      where: { id: dto.id, status: S.ORDERED },
      data: {
        status: S.COLLECTED,
        collectedAt: new Date(),
        collectedById: user.id,
        collectionComment: dto.comment,
      },
    });
    if (claimed.count === 0) bad(Err.STATUS_ALREADY_CHANGED);

    // the same equipment can appear on several lines (one per segment)
    const perEquipment = new Map<string, number>();
    for (const line of emrf.items) {
      const qty = qtys.get(line.id) ?? 0;
      await tx.emrfItem.update({
        where: { id: line.id },
        data: { collectedQty: qty },
      });
      const sum = perEquipment.get(line.equipmentId) ?? 0;
      perEquipment.set(line.equipmentId, sum + qty);
    }

    // take the collected materials out of warehouse stock
    for (const [equipmentId, qty] of perEquipment) {
      if (qty === 0) continue;
      const taken = await tx.equipment.updateMany({
        where: { id: equipmentId, available: { gte: qty } },
        data: { available: { decrement: qty } },
      });
      if (taken.count === 0) {
        const { mtnCode, available } = await tx.equipment.findUniqueOrThrow({
          where: { id: equipmentId },
          select: { mtnCode: true, available: true },
        });
        bad(Err.INVALID_INPUT, `Only ${available} of ${mtnCode} in stock`);
      }
    }

    return tx.emrf.findUniqueOrThrow({
      where: { id: dto.id },
      select: emrfCollectionS,
    });
  });
}
