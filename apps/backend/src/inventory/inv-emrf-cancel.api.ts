
import { EmrfLogAction, EmrfStatus } from "schema/enums";
import { bad, Err } from "schema/errors";
import { emrfS } from "schema/inventory";
import { z } from "schema/utils";
import { Allow } from "#/auth/guard";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";
import type { UserFullT } from "schema/people";

const emrfCancelZ = z.object({
  id: z.uuid(),
  comment: z.string().trim().min(1).max(5000).optional(),
  uploads: z.array(z.uuid()).max(20).default([]),
});

export const emrfCancelApi = postRoute({
  url: "/inventory/emrf/cancel",
  schema: emrfCancelZ,
  allow: Allow.STAFF,
  handler: (req) => cancelEmrf(req.body, req.authUser),
});

async function cancelEmrf(
  { id, comment, uploads }: z.infer<typeof emrfCancelZ>,
  user: UserFullT,
) {
  const uploadIds = [...new Set(uploads ?? [])];

  return prisma.$transaction(async (tx) => {
    if (uploadIds.length > 0) {
      const foundUploads = await tx.upload.count({
        where: { id: { in: uploadIds } },
      });

      if (foundUploads !== uploadIds.length) {
        bad(Err.NOT_FOUND, "Upload");
      }
    }

    // Only REQUESTED EMRFs may be cancelled.
    const result = await tx.emrf.updateMany({
      where: {
        id,
        status: EmrfStatus.REQUESTED,
      },
      data: {
        status: EmrfStatus.CANCELLED,
      },
    });

    if (result.count === 0) {
      const existing = await tx.emrf.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!existing) bad(Err.NOT_FOUND);
      bad(Err.STATUS_ALREADY_CHANGED);
    }

    await tx.emrfLog.create({
      data: {
        emrfId: id,
        action: EmrfLogAction.CANCELLED,
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
      where: { id },
      select: emrfS,
    });
  });
}
