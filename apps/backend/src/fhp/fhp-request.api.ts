import { type FhpRequestT, fhpRequestZ, ftthProjectS } from "schema/fhp";
import type { UserFullT } from "schema/people";
import { prisma, StaffRole, WorkAction, WorkStatus } from "#/prisma";
import { bad, connectId, maybeConnect, postRoute } from "#/utils";
import { addLog, create, nextId, setCoords } from "../utils/queries";

export default postRoute(
  "/fhp",
  () => fhpRequestZ,
  (req) => fhpRequest(req.body, req.authUser),
);

const ID = "FHP";
const action = WorkAction.REQUEST;
const status = WorkStatus.REQUESTED;
const toWhom = StaffRole.PROJECT_MANAGER;

async function fhpRequest(body: FhpRequestT, from: UserFullT) {
  const s = await prisma.ftthSurvey.findUnique({
    where: { id: body.surveyId },
  });
  if (!s) bad("Survey not found");

  return prisma.$transaction(async (tx) => {
    const { sid, requestDate } = await nextId(tx, ID);
    return tx.ftthProject.create({
      data: {
        work: create({
          status,
          sid,
          requestDate,
          name: body.name,
          contact: body.contact,
          locality: connectId(body.localityId),
          coords: setCoords(body.coords),
          logs: addLog(body, action, from, status),
          workers: create({ userId: body.managerId, role: toWhom }),
        }),
        survey: maybeConnect(body.surveyId),
        hp: body.hp || s.reportedHp || s.proposedHp || 0,
      },
      select: ftthProjectS,
    });
  });
}
