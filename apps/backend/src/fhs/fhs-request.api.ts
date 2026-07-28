import { bad, Err } from "schema/errors";
import { type FhsRequestT, fhsRequestZ, ftthSurveyS } from "schema/fhs";
import type { UserT } from "schema/people";
import {
  type Prisma,
  prisma,
  StaffRole,
  WorkAction,
  WorkDocType,
  WorkStatus,
} from "#/db";
import { connectId } from "#/utils/ids";
import { postRoute } from "#/utils/routing";
import { ringWithBbox } from "../geo/utils";
import {
  addLog,
  create,
  makeKey,
  nextId,
  setCoords,
  setDocsFrom,
} from "../utils/queries";

export const fhsRequestApi = postRoute({
  url: "/fhs",
  schema: fhsRequestZ,
  handler: (req) => fhsRequest(req.body, req.authUser),
});

const action = WorkAction.REQUEST;
const status = WorkStatus.REQUESTED;
const sendTo = StaffRole.PLANNING_MANAGER;

async function fhsRequest(dto: FhsRequestT, from: UserT) {
  const key = await nameCheck(dto.name);
  const boundary = await boundaryQuery(dto.AREA_KMZ);

  return prisma.$transaction(async (tx) => {
    const { sid, requestDate } = await nextId(tx, "FHS");
    return tx.ftthSurvey.create({
      data: {
        boundary,
        area: dto.area,
        work: create({
          name: dto.name,
          key,
          sid,
          status,
          requestDate,
          locality: connectId(dto.localityId),
          coords: setCoords(dto.coords),
          docs: setDocsFrom(dto, WorkDocType.AREA_KMZ),
          logs: addLog(dto, action, from, status),
          workers: create({ userId: dto.managerId, role: sendTo }),
        }),
      },
      select: ftthSurveyS,
    });
  });
}

type FhsInput = Prisma.FtthSurveyCreateInput;

async function nameCheck(name: string) {
  const key = makeKey(name);
  const dup = await prisma.work.findFirst({
    where: { key, fhs: { isNot: null } },
  });
  const canRedo: WorkStatus[] = [WorkStatus.CANCELLED, WorkStatus.DECLINED];
  if (dup && !canRedo.includes(dup.status)) {
    bad(Err.ALREADY_EXISTS, dup.name);
  }
  return key;
}

async function boundaryQuery(id: string): Promise<FhsInput["boundary"]> {
  const up = await prisma.upload.findUnique({ where: { id } });
  if (up?.parsed?.type !== WorkDocType.AREA_KMZ) return undefined;
  return { create: ringWithBbox(up.parsed.boundary) };
}
