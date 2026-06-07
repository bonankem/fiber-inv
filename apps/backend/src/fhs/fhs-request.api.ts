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
import { connectId, postRoute } from "#/utils";
import { ringWithBbox } from "../geo/utils";
import {
  addLog,
  create,
  nextId,
  setCoords,
  setDocsFrom,
} from "../utils/queries";

export default postRoute(
  "/fhs",
  () => fhsRequestZ,
  (req) => fhsRequest(req.body, req.authUser),
);

const action = WorkAction.REQUEST;
const status = WorkStatus.REQUESTED;
const recipient = StaffRole.PLANNING_MANAGER;
const { PLAQUE_KMZ } = WorkDocType;

type FhsInput = Prisma.FtthSurveyCreateInput;

async function boundaryCreate(id: string): Promise<FhsInput["boundary"]> {
  const up = await prisma.upload.findUnique({ where: { id } });
  if (up?.parsed?.type !== PLAQUE_KMZ) return undefined;
  return { create: ringWithBbox(up.parsed.boundary) };
}

async function fhsRequest(dto: FhsRequestT, from: UserT) {
  const boundary = await boundaryCreate(dto.PLAQUE_KMZ);
  const { name, contact } = dto;

  return prisma.$transaction(async (tx) => {
    const { sid, requestDate } = await nextId(tx, "FHS");
    return tx.ftthSurvey.create({
      select: ftthSurveyS,
      data: {
        boundary,
        contact,
        work: create({
          sid,
          name,
          status,
          requestDate,
          locality: connectId(dto.localityId),
          coords: setCoords(dto.coords),
          docs: setDocsFrom(dto, PLAQUE_KMZ),
          logs: addLog(dto, action, from, status),
          workers: create({
            userId: dto.managerId,
            role: recipient,
          }),
        }),
      },
    });
  });
}
