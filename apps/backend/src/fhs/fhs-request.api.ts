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
import { bad, connectId, postRoute } from "#/utils";
import { ringWithBbox } from "../geo/utils";
import {
  addLog,
  create,
  makeKey,
  nextId,
  setCoords,
  setDocsFrom,
} from "../utils/queries";

export const fhsRequestApi = postRoute(
  "/fhs",
  () => fhsRequestZ,
  (req) => fhsRequest(req.body, req.authUser),
);

const action = WorkAction.REQUEST;
const status = WorkStatus.REQUESTED;
const sendTo = StaffRole.PLANNING_MANAGER;

async function fhsRequest(dto: FhsRequestT, from: UserT) {
  const { name, contact, isNewArea } = dto;
  const key = await nameCheck(name);
  const boundary = await boundaryQuery(dto.PLAQUE_KMZ);

  return prisma.$transaction(async (tx) => {
    const { sid, requestDate } = await nextId(tx, "FHS");
    return tx.ftthSurvey.create({
      data: {
        boundary,
        contact,
        isNewArea,
        work: create({
          sid,
          key,
          name,
          status,
          requestDate,
          area: areaQuery(dto),
          locality: connectId(dto.localityId),
          coords: setCoords(dto.coords),
          docs: setDocsFrom(dto, WorkDocType.PLAQUE_KMZ),
          logs: addLog(dto, action, from, status),
          workers: create({ userId: dto.managerId, role: sendTo }),
        }),
      },
      select: ftthSurveyS,
    });
  });
}

type FhsInput = Prisma.FtthSurveyCreateInput;
type FhsWorkInput = Prisma.WorkCreateWithoutFhsInput;

async function nameCheck(name: string) {
  const key = makeKey(name);
  const dup = await prisma.work.findFirst({
    where: { key, fhs: { isNot: null } },
  });
  const canRedo: WorkStatus[] = [WorkStatus.CANCELLED, WorkStatus.DECLINED];
  if (dup && !canRedo.includes(dup.status)) {
    bad(`Survey already exists: ${dup.name}`);
  }
  return key;
}

function areaQuery(dto: FhsRequestT): FhsWorkInput["area"] {
  const name = dto.name;
  const code = dto.areaCode;
  return {
    connectOrCreate: {
      where: { code },
      create: {
        code,
        name,
        key: makeKey(name),
        locality: connectId(dto.localityId),
      },
    },
  };
}

async function boundaryQuery(id: string): Promise<FhsInput["boundary"]> {
  const up = await prisma.upload.findUnique({ where: { id } });
  if (up?.parsed?.type !== WorkDocType.PLAQUE_KMZ) return undefined;
  return { create: ringWithBbox(up.parsed.boundary) };
}
