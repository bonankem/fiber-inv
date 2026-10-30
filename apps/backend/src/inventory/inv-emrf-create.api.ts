import { EmrfLogAction, EmrfStatus, WorkStatus } from "schema/enums";
import { bad, Err } from "schema/errors";
import { type EmrfCreateT, emrfCreateZ, emrfS } from "schema/inventory";
import type { UserFullT } from "schema/people";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";
import { workAccess } from "../work/filter";

export const emrfCreateApi = postRoute({
  url: "/inventory/emrf",
  schema: emrfCreateZ,
  handler: (req) => createEmrf(req.body, req.authUser),
});

async function createEmrf({ surveyId, items, comment, uploads }: EmrfCreateT, user: UserFullT) {
  // vendors may only request materials for their own jobs
  const uploadIds: string[] = [...new Set(uploads ?? [])];


  if (uploadIds.length > 0) {
    const foundUploads = await prisma.upload.count({
      where: {
        id: { in: uploadIds },
      },
    });
    if (foundUploads !== uploadIds.length) {
      bad(Err.NOT_FOUND, "Upload");
    }
  }
  const survey = await prisma.ftthSurvey.findFirst({
    where: { id: surveyId, work: workAccess(user) },
    select: { work: { select: { status: true } } },
  });
  if (!survey) bad(Err.NOT_FOUND, "HP Planning job");
  if (survey.work.status !== WorkStatus.CLOSED) {
    bad(Err.INVALID_INPUT, "The HP Planning job is not closed yet");
  }

  const ids = new Set(items.map((item) => item.equipmentId));
  const found = await prisma.equipment.count({
    where: { id: { in: [...ids] } },
  });
  if (found !== ids.size) bad(Err.NOT_FOUND, "Inventory item");

  return prisma.$transaction(async (tx) => {
    const emrf = await tx.emrf.create({
      data: {
        status: EmrfStatus.REQUESTED,
        surveyId,
        items: {
          create: items.map((item) => ({
            equipmentId: item.equipmentId,
            segment: item.segment,
            position: item.position,
            requestedQty: item.requestQty,
          })),
        },
      },
      select: { id: true },
    });

    // Validate upload ownership/authorization before this point.
    await tx.emrfLog.create({
      data: {
        emrfId: emrf.id,
        action: EmrfLogAction.CREATED,
        actorId: user.id,
        comment: comment ?? null,
        uploads: {
          create: uploadIds.map((uploadId) => ({
            upload: {
              connect: { id: uploadId },
            },
          })),
        },
      },
    });

    return tx.emrf.findUniqueOrThrow({
      where: { id: emrf.id },
      select: emrfS,
    });
  });
}
