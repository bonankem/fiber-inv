import { type FhsCodesT, fhsCodesUrl } from "schema/fhs";
import { prisma } from "#/db";
import { getRoute } from "#/utils";
import { workStopped } from "./filter";

export const fhsCodesApi = getRoute(fhsCodesUrl, null, fhsCodes);

async function fhsCodes(): Promise<FhsCodesT> {
  const areas = await prisma.ftthArea.findMany({
    select: {
      works: {
        where: { status: { notIn: workStopped } },
        select: { sid: true },
      },
      code: true,
      name: true,
      key: true,
    },
    orderBy: { code: "asc" },
  });
  return areas.map((a) => ({
    ...a,
    works: a.works.map((w) => w.sid).sort(),
  }));
}
