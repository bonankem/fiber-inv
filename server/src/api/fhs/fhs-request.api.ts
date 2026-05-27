import { type FhsRequestT, fhsRequestZ, ftthSurveyS } from "schema/fhs";

import {
  type Prisma,
  prisma,
  StaffRole,
  WorkAction,
  WorkDocType,
  WorkStatus,
} from "#/prisma";
import { connectId, postRoute } from "#/utils";
import { getBoundingBox } from "../geo/utils";
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
  (req) => fhsRequest(req.body),
);

const action = WorkAction.REQUEST;
const status = WorkStatus.REQUESTED;

type BoundaryCreate = Prisma.FtthSurveyCreateInput["boundary"];

async function makeBoundary(id: string): Promise<BoundaryCreate> {
  const up = await prisma.upload.findUnique({ where: { id } });
  if (up?.parsed?.type !== WorkDocType.PLAQUE_KMZ) return undefined;
  const multiPolygon = [[up.parsed.boundary]];
  const bbox = getBoundingBox(multiPolygon);
  return { create: { multiPolygon, ...bbox } };
}

async function fhsRequest(body: FhsRequestT) {
  const boundary = await makeBoundary(body.PLAQUE_KMZ);

  return prisma.$transaction(async (tx) => {
    const { sid, requestDate } = await nextId(tx, "FHS");
    return tx.ftthSurvey.create({
      data: {
        work: create({
          status,
          sid,
          requestDate,
          name: body.name,
          contact: body.contact,
          locality: connectId(body.localityId),
          coords: setCoords(body.coords),
          docs: setDocsFrom(body, WorkDocType.PLAQUE_KMZ),
          logs: addLog(body, action, status),
          workers: create({
            userId: body.managerId,
            role: StaffRole.PLANNING_MANAGER,
          }),
        }),
        boundary,
      },
      select: ftthSurveyS,
    });
  });
}
