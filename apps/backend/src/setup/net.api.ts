import { BoxType, prisma } from "#/db";
import { makeKey } from "#/utils/queries";
import { postRoute } from "#/utils/routing";

export const setupNetApi = postRoute({
  url: "/setup/net",
  handler: setupNet,
});
async function setupNet() {
  const oem = await prisma.oem.findFirstOrThrow({
    where: { name: "Huawei" },
  });

  const olt = await prisma.olt.upsert({
    where: { name: "CI00123-OLT" },
    update: {},
    create: {
      site: "CI00123",
      name: "CI00123-OLT",
      key: makeKey("CI00123-OLT"),
      oemId: oem.id,
    },
  });

  const boxNames = [
    "GAGNO-X01-H01",
    "GAGNO-X01-H01-S01",
    "GAGNO-X01-H01-S02",
    "GAGNO-X01-H01-S03",
    "GAGNO-X01-H01-E01",
  ];

  const boxes = await prisma.ftthBox.createMany({
    data: boxNames.map((name) => ({
      name,
      oemId: oem.id,
      oltId: olt.id,
      type: name.includes("-E0")
        ? BoxType.END
        : name.includes("-S0")
          ? BoxType.SUB
          : BoxType.HUB,
    })),
    skipDuplicates: true,
  });

  return { oem, olt, boxes };
}
