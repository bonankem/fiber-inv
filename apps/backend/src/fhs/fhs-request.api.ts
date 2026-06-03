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
const { PLAQUE_KMZ } = WorkDocType;

async function boundaryCreate(
  id: string,
): Promise<Prisma.FtthSurveyCreateInput["boundary"]> {
  const up = await prisma.upload.findUnique({ where: { id } });
  if (up?.parsed?.type !== PLAQUE_KMZ) return undefined;
  return { create: ringWithBbox(up.parsed.boundary) };
}

async function fhsRequest(body: FhsRequestT, from: UserT) {
  const boundary = await boundaryCreate(body.PLAQUE_KMZ);

  return prisma.$transaction(async (tx) => {
    const { sid, requestDate } = await nextId(tx, "FHS");
    return tx.ftthSurvey.create({
      select: ftthSurveyS,
      data: {
        work: create({
          status,
          sid,
          requestDate,
          name: body.name,
          contact: body.contact,
          locality: connectId(body.localityId),
          coords: setCoords(body.coords),
          docs: setDocsFrom(body, PLAQUE_KMZ),
          logs: addLog(body, action, from, status),
          workers: create({
            userId: body.managerId,
            role: StaffRole.PLANNING_MANAGER,
          }),
        }),
        boundary,
      },
    });
  });
}
