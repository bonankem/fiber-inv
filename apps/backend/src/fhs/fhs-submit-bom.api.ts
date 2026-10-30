import { unique } from "remeda";
import { bad, Err } from "schema/errors";
import { type FhsSubmitBomT, fhsSubmitBomZ, ftthSurveyS } from "schema/fhs";
import type { UserT } from "schema/people";
import { prisma, WorkAction, WorkStatus } from "#/db";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";
import { fhsCheck, fhsWorker } from "./utils";

export const fhsSubmitBomApi = postRoute({
  url: "/fhs/bom",
  schema: fhsSubmitBomZ,
  handler: (req) => fhsSubmitBom(req.body, req.authUser),
});

async function fhsSubmitBom(dto: FhsSubmitBomT, user: UserT) {
  const { id, items, FHS_BOM } = dto;
  const { s } = await fhsCheck({
    workId: id,
    status: [WorkStatus.BOM, WorkStatus.BOM_REJECTED],
  });

  const eqIds = unique(items.map((item) => item.equipmentId));
  if (eqIds.length !== items.length) bad(Err.DUPLICATE_ENTRY, "BOM");

  const found = await prisma.equipment.count({ where: { id: { in: eqIds } } });
  if (found !== eqIds.length) bad(Err.NOT_FOUND, "Equipment");

  return prisma.ftthSurvey.update({
    where: { id },
    data: {
      bom: {
        deleteMany: {},
        create: items.map((item, position) => ({ ...item, position })),
      },
      work: updateWork({
        dto,
        work: s.work,
        sender: user,
        action: WorkAction.SUBMIT_BOM,
        status: WorkStatus.BOM_VALIDATION,
        docs: { FHS_BOM },
        logTo: fhsWorker(s)?.name,
      }),
    },
    select: ftthSurveyS,
  });
}
