import { groupBy, mapValues, unique } from "remeda";
import { type FhsCodesT, fhsCodesUrl } from "schema/fhs";
import { filterTruthy } from "schema/utils";
import { prisma, WorkStatus } from "#/db";
import { getRoute } from "#/utils/routing";

export const fhsCodesApi = getRoute({
  url: fhsCodesUrl,
  handler: fhsCodes,
});

async function fhsCodes(): Promise<FhsCodesT> {
  const boxes = await prisma.ftthBox.findMany({
    distinct: ["area"],
    select: { area: true },
  });

  const unconfirmed = [
    WorkStatus.REQUESTED,
    WorkStatus.DECLINED,
    WorkStatus.CANCELLED,
  ];
  const surveys = await prisma.ftthSurvey.findMany({
    select: { area: true, work: { select: { sid: true } } },
    where: { work: { status: { notIn: unconfirmed } } },
  });

  const byCode = mapValues(
    groupBy(surveys, (s) => s.area || ""),
    (ss) => ss.map((s) => s.work.sid),
  );
  const codes = unique([
    ...boxes.map((b) => b.area),
    ...surveys.map((s) => s.area),
  ]);
  const sorted = filterTruthy(unique(codes)).sort();
  return sorted.map((code) => ({ code, works: byCode[code] || "" }));
}
