import { uuidv7 } from "uuidv7";
import { prisma } from "#/prisma";
import { bad, postRoute } from "#/utils";
import { makeKey } from "../utils/queries";
import { geoDefaults } from "./defaults";

export default postRoute("/geo/save", null, () => saveCities());

async function saveCities() {
  if (await prisma.city.findFirst()) {
    bad("Cities already saved");
  }
  const districts = geoDefaults.map(({ name }) => ({
    id: uuidv7(),
    key: makeKey(name),
    name,
  }));

  const districtIds = Object.fromEntries(districts.map((d) => [d.name, d.id]));

  const cities = geoDefaults.flatMap((d) => {
    return d.list.map((name) => {
      const id = uuidv7();
      const key = makeKey(name);
      // biome-ignore lint/style/noNonNullAssertion: -
      const districtId = districtIds[d.name]!;
      return { id, key, name, districtId };
    });
  });

  return prisma.$transaction([
    prisma.district.createMany({ data: districts, skipDuplicates: true }),
    prisma.city.createMany({ data: cities, skipDuplicates: true }),
  ]);
}
