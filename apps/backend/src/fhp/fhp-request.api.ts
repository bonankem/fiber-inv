import { Err, mustHave } from "schema/errors";
import { type FhpRequestT, fhpRequestZ, ftthProjectS } from "schema/fhp";
import type { UserFullT } from "schema/people";
import { prisma, StaffRole, WorkAction, WorkStatus } from "#/db";
import { connectId, maybeConnect } from "#/utils/ids";
import { postRoute } from "#/utils/routing";
import { addLog, create, makeKey, nextId, setCoords } from "../utils/queries";

export const fhpRequestApi = postRoute({
  url: "/fhp",
  schema: fhpRequestZ,
  handler: (req) => fhpRequest(req.body, req.authUser),
});

const ID = "FHP";
const action = WorkAction.REQUEST;
const status = WorkStatus.REQUESTED;
const toWhom = StaffRole.PROJECT_MANAGER;

async function fhpRequest(dto: FhpRequestT, from: UserFullT) {
  const s = await prisma.ftthSurvey.findUnique({
    where: { id: dto.surveyId },
  });
  mustHave(s, "surveyId", Err.NOT_FOUND);

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
        hp: dto.hp || s.reportedHp || s.expectedHp || 0,
      },
      select: ftthProjectS,
    });
  });
}
