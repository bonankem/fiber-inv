import {
  type FhsInitiateT,
  type FtthSurveyT,
  fhsInitiateZ,
  ftthSurveyS,
} from "schema/fhs";
import type { UserT } from "schema/people";
import { type Prisma, prisma, WorkAction, WorkStatus } from "#/db";
import { bad, connectId, postRoute } from "#/utils";
import { makeKey } from "#/utils/queries";
import { Allow } from "../auth/guard";
import { updateWork } from "../utils/work";
import { fhsCheck } from "./utils";

export const fhsInitiateApi = postRoute(
  "/fhs/initiate",
  () => fhsInitiateZ,
  (req) => fhsInitiate(req.body, req.authUser),
  Allow.STAFF,
);

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
      expectedHp: dto.expectedHp,
      work: updateWork({
        dto,
        old: s.work,
        vendor: dto.vendorId,
        action: WorkAction.INITIATE,
        status: WorkStatus.ONGOING,
        logTo: vendor,
        from: user,
        also: {
          startDate,
          dueDate,
          area: areaQuery(dto, s),
        },
      }),
    },
    select: ftthSurveyS,
  });
}

function areaQuery(dto: FhsInitiateT, fhs: FtthSurveyT) {
  const code = dto.areaCode;
  const { area, locality } = fhs.work;
  if (!code || code === area?.code) return undefined;

  const name = fhs.work.name;
  const localityId = locality?.id || bad("No locality");
  return {
    connectOrCreate: {
      where: { code },
      create: {
        code,
        name,
        key: makeKey(name),
        locality: connectId(localityId),
      },
    },
  } satisfies Prisma.FtthAreaUpdateOneWithoutWorksNestedInput;
}
