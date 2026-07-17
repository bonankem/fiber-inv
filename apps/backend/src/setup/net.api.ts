import { prisma } from "#/db";
import { geoInitialize } from "#/geo/geo-initialize.api";
import { makeKey } from "#/utils/queries";
import { postRoute } from "#/utils/routing";

export const setupNetApi = postRoute({
  url: "/setup/net",
  handler: setupNet,
});
async function setupNet() {
  const deleted = await prisma.$transaction([
    prisma.cable.deleteMany(),
    prisma.ftthBox.deleteMany(),
    prisma.olt.deleteMany(),
    prisma.locality.deleteMany(),
    prisma.district.deleteMany(),
  ]);
  const geo = await geoInitialize();
  const oem = await prisma.oem.createMany({
    data: [
      { name: "Huawei", key: makeKey("Huawei") },
      { name: "ZTE", key: makeKey("ZTE") },
    ],
    skipDuplicates: true,
  });

  return { oem, geo, del: deleted.map((d) => d.count) };
}
