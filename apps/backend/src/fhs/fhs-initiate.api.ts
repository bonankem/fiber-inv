import { mustHave } from "schema/errors";
import { type FhsInitiateT, fhsInitiateZ, ftthSurveyS } from "schema/fhs";
import type { UserT } from "schema/people";
import { prisma, WorkAction, WorkStatus } from "#/db";
import { postRoute } from "#/utils/routing";
import { Allow } from "../auth/guard";
import { updateWork } from "../utils/work";
import { fhsCheck } from "./utils";

export const fhsInitiateApi = postRoute({
  url: "/fhs/initiate",
  schema: fhsInitiateZ,
  allow: Allow.STAFF,
  handler: (req) => fhsInitiate(req.body, req.authUser),
});

async function fhsInitiate(dto: FhsInitiateT, user: UserT) {
  const { id, vendorId, startDate, dueDate } = dto;
  const { s, v } = await fhsCheck({
    workId: id,
    vendorId,
    status: WorkStatus.ASSIGNED,
  });
  const vendor = v || s.work.vendor;
  mustHave(vendor, "vendorId");

  return prisma.ftthSurvey.update({
    where: { id },
    data: {
      expectedHp: dto.expectedHp,
      work: updateWork({
        dto,
        old: s.work,
        vendor: dto.vendorId,
        action: WorkAction.INITIATE,
        status: WorkStatus.SURVEY,
        logTo: vendor,
        from: user,
        also: {
          startDate,
          dueDate,
        },
      }),
    },
    select: ftthSurveyS,
  });
}
