import {
  type FhsInitiateT,
  type FtthSurveyT,
  fhsInitiateZ,
  ftthSurveyS,
} from "schema/fhs";
import type { UserT } from "schema/people";
import { prisma, WorkAction, WorkStatus } from "#/db";
import { bad, postRoute } from "#/utils";
import { Allow } from "../auth/guard";
import { updateWork } from "../utils/work";
import { fhsCheck } from "./utils";

export default postRoute(
  "/fhs/initiate",
  () => fhsInitiateZ,
  (req) => fhsInitiate(req.body, req.authUser),
  Allow.STAFF,
);

async function checkArea(dto: FhsInitiateT, fhs: FtthSurveyT) {
  if (!dto.isNewArea) {
    const id = dto.areaId || bad("Area is required");
    return { connect: { id } };
  }
  const code = dto.areaCode || bad("Code required for new areas");
  const area = await prisma.ftthArea.findUnique({ where: { code } });
  if (area) bad(`${code} already exists: ${area.name}`);

  const { key, name, locality } = fhs.work;

  // surveys should always have locality, but check to be sure
  const localityId = locality?.id || bad("Locality required");
  return { create: { code, key, name, localityId } };
}

async function fhsInitiate(dto: FhsInitiateT, user: UserT) {
  const { id, vendorId, startDate, dueDate } = dto;
  const { s, v } = await fhsCheck({
    workId: id,
    vendorId,
    status: WorkStatus.ASSIGNED,
    statusError: "Job is already initiated",
  });

  const vendor = v || s.work.vendor;
  if (!vendor) bad("Vendor is required");

  return prisma.ftthSurvey.update({
    where: { id },
    data: {
      area: await checkArea(dto, s),
      isNewArea: dto.isNewArea,
      proposedHp: dto.proposedHp,
      work: updateWork({
        dto,
        old: s.work,
        vendor: dto.vendorId,
        action: WorkAction.INITIATE,
        status: WorkStatus.ONGOING,
        logTo: vendor,
        from: user,
        also: { startDate, dueDate },
      }),
    },
    select: ftthSurveyS,
  });
}
