import { type FhsRequestT, fhsRequestZ, ftthSurveyS } from "schema/fhs";
import {
  prisma,
  StaffRole,
  WorkAction,
  WorkDocType,
  WorkStatus,
} from "#/prisma";
import { connectId, postRoute } from "#/utils";
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

async function fhsRequest(body: FhsRequestT) {
  return prisma.$transaction(async (tx) => {
    const { sid, requestDate } = await nextId(tx, "FHS");
    return tx.ftthSurvey.create({
      data: {
        work: create({
          status,
          sid,
          requestDate,
          name: body.name,
          locality: connectId(body.localityId),
          coords: setCoords(body.coords),
          docs: setDocsFrom(body, WorkDocType.PLAQUE_KMZ),
          logs: addLog(body, action, status),
          workers: create({
            userId: body.managerId,
            role: StaffRole.PLANNING_MANAGER,
          }),
        }),
        contact: body.contact,
      },
      select: ftthSurveyS,
    });
  });
}
