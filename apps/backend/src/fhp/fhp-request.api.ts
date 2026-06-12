import { type FhpRequestT, fhpRequestZ, ftthProjectS } from "schema/fhp";
import type { UserFullT } from "schema/people";
import { prisma, StaffRole, WorkAction, WorkStatus } from "#/db";
import { bad, connectId, maybeConnect, postRoute } from "#/utils";
import { addLog, create, makeKey, nextId, setCoords } from "../utils/queries";

export default postRoute(
  "/fhp",
  () => fhpRequestZ,
  (req) => fhpRequest(req.body, req.authUser),
);

const ID = "FHP";
const action = WorkAction.REQUEST;
const status = WorkStatus.REQUESTED;
const toWhom = StaffRole.PROJECT_MANAGER;

async function fhpRequest(dto: FhpRequestT, from: UserFullT) {
  const s = await prisma.ftthSurvey.findUnique({
    where: { id: dto.surveyId },
  });
  if (!s) bad("Survey not found");

  return prisma.$transaction(async (tx) => {
    const { sid, requestDate } = await nextId(tx, ID);
    return tx.ftthProject.create({
      data: {
        contact: dto.contact,
        work: create({
          status,
          sid,
          requestDate,
          name: dto.name,
          key: makeKey(dto.name),
          locality: connectId(dto.localityId),
          coords: setCoords(dto.coords),
          logs: addLog(dto, action, from, status),
          workers: create({ userId: dto.managerId, role: toWhom }),
        }),
        survey: maybeConnect(dto.surveyId),
        hp: dto.hp || s.reportedHp || s.proposedHp || 0,
      },
      select: ftthProjectS,
    });
  });
}
