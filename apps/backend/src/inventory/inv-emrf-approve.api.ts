
import { EmrfLogAction, EmrfStatus, StaffRole } from "schema/enums";
import { bad, Err } from "schema/errors";
import {
  type EmrfApproveT,
  emrfApproveZ,
  emrfS,
} from "schema/inventory";
import type { UserFullT } from "schema/people";
import { Allow } from "#/auth/guard";
import { prisma } from "#/db";
import { postRoute } from "#/utils/routing";

const S = EmrfStatus;

// One approval is enough, from either manager.
const approvers: StaffRole[] = [
  StaffRole.PLANNING_MANAGER,
  StaffRole.PROJECT_MANAGER,
];

export const emrfApproveApi = postRoute({
  url: "/inventory/emrf/approve",
  schema: emrfApproveZ,
  allow: Allow.STAFF,
  handler: (req) => approveEmrf(req.body, req.authUser),
});

async function approveEmrf(
  { id, comment, uploads }: EmrfApproveT,
  user: UserFullT,
) {
  // Admins bypass RBAC, as in the existing auth guard.
  const canApprove =
    !!user.staffRole && approvers.includes(user.staffRole);

  if (!user.isAdmin && !canApprove) {
    bad(Err.ACCESS_DENIED);
  }

  // Preserve the existing not-found and status checks.
  const emrf = await prisma.emrf.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!emrf) bad(Err.NOT_FOUND);
  if (emrf.status !== S.REQUESTED) {
    bad(Err.STATUS_ALREADY_CHANGED);
  }

  // Deduplicate and validate attachment IDs.
  const uploadIds = [...new Set(uploads ?? [])];

  if (uploadIds.length > 0) {
    const foundUploads = await prisma.upload.count({
      where: { id: { in: uploadIds } },
    });

    if (foundUploads !== uploadIds.length) {
      bad(Err.NOT_FOUND, "Upload");
    }
  }

  // Update the EMRF and write its log atomically.
  return prisma.$transaction(async (tx) => {
    const result = await tx.emrf.updateMany({
      where: { id, status: S.REQUESTED },
      data: {
        status: S.APPROVED,
        approvedAt: new Date(),
        approvedById: user.id,
      },
    });

    // Protect against concurrent approval attempts.
    if (result.count === 0) {
      bad(Err.STATUS_ALREADY_CHANGED);
    }

    await tx.emrfLog.create({
      data: {
        emrfId: id,
        action: EmrfLogAction.APPROVED,
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
