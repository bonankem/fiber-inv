import { type FhpImageT, fhpImageS } from "schema/fhp";
import { prisma } from "#/db";
import { idRoute } from "#/utils";

export default idRoute("/fhp/:id/images", (req) => fhpGetImages(req.params.id));

async function fhpGetImages(fhpId: string): Promise<FhpImageT[]> {
  return prisma.fhpImage.findMany({
    where: { fhpId },
    select: fhpImageS,
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}
