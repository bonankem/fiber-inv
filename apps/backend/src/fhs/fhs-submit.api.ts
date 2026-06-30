import { uniqueBy } from "remeda";
import { bad, Err } from "schema/errors";
import { type FhsSubmitT, fhsSubmitZ, ftthSurveyS } from "schema/fhs";
import type { UserT } from "schema/people";
import { filterTruthy } from "schema/utils";
import { type Prisma, prisma, WorkAction, WorkDocType, WorkStatus } from "#/db";
import { postRoute } from "#/utils/routing";
import { currentDate } from "#/utils/time";
import { createManyCoords, getLatLngId } from "../utils/queries";
import { updateWork } from "../utils/work";
import { fhsCheck, fhsWorker } from "./utils";

export const fhsSubmitApi = postRoute({
  url: "/fhs/submit",
  schema: fhsSubmitZ,
  handler: (req) => fhsSubmit(req.body, req.authUser),
});

async function getReportedBoxes(uploadId: string) {
  const coords = await prisma.upload.findFirst({
    where: { id: uploadId },
    select: { parsed: true },
  });
  if (coords?.parsed?.type !== WorkDocType.COORDINATES) {
    bad(Err.INVALID_FILE, WorkDocType.COORDINATES);
  }
  const now = new Date();
  const parsedBoxes = uniqueBy(coords.parsed.boxes, (b) => b.name);

  await prisma.coords.createMany({
    data: createManyCoords(parsedBoxes.map((b) => b.coords)),
    skipDuplicates: true,
  });
  const boxes = filterTruthy(
    parsedBoxes.map((b) => {
      const { name, type, hp, coords } = b;
      if (!type || !coords) return null;
      const coordsId = getLatLngId(coords.lat, coords.lng);
      return { name, type, hp, coordsId, createdAt: now };
    }),
  );

  return {
    deleteMany: { createdAt: { lt: now } },
    createMany: { data: boxes },
  };
}

async function fhsSubmit(dto: FhsSubmitT, from: UserT) {
  const {
    id,
    comment,
    uploads,
    PLAN_KMZ,
    PLAN_BOQ,
    PLAN_DIAGRAM,
    SYNOPTIC_TABLE,
    SYNOPTIC_DIAGRAM,
    COORDINATES,
    CABLE_LENGTHS,
    HP_SUMMARY,
    ...fields
  } = dto;
  const { s } = await fhsCheck({
    workId: id,
    status: [WorkStatus.ONGOING, WorkStatus.REVIEW_FAILED],
  });

  const report = {
    ...fields,
    submitDate: currentDate(),
  } satisfies Prisma.FhsReportUpdateInput;
  const resent = s.work.status !== WorkStatus.ONGOING;
  const action = resent ? WorkAction.RESEND_REPORT : WorkAction.SUBMIT_REPORT;
  // const boxes = await getReportedBoxes(COORDINATES);

  return prisma.ftthSurvey.update({
    select: ftthSurveyS,
    where: { id },
    data: {
      reportedHp: report.hp,
      report: {
        upsert: {
          create: report,
          update: report,
        },
      },
      work: updateWork({
        dto,
        old: s.work,
        from,
        action,
        status: WorkStatus.REVIEW,
        logTo: fhsWorker(s)?.name,
        docs: {
          PLAN_KMZ,
          PLAN_BOQ,
          PLAN_DIAGRAM,
          SYNOPTIC_TABLE,
          SYNOPTIC_DIAGRAM,
          COORDINATES,
          CABLE_LENGTHS,
          HP_SUMMARY,
        },
      }),
    },
  });
}
