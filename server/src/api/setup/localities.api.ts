import { uuidv7 } from "uuidv7";
import { prisma } from "#/prisma";
import { postRoute } from "#/utils";
import { makeKey } from "../utils/queries";
import { geoNames } from "./geo.names";

export default postRoute("/setup/localities", null, async () => {
  const old = await prisma.district.findMany({
    select: { id: true, key: true, name: true },
  });
  return prisma.$transaction(setupLocalities(old));
});

export function setupLocalities(
  old?: { id: string; key: string; name: string }[],
) {
  const districts = old?.length
    ? old
    : geoNames.map(({ name }) => ({
        id: uuidv7(),
        key: makeKey(name),
        name,
      }));

  const districtIds = Object.fromEntries(districts.map((d) => [d.name, d.id]));

  const localities = geoNames.flatMap((d) => {
    return d.list.map((name) => {
      const id = uuidv7();
      const key = makeKey(name);
      // biome-ignore lint/style/noNonNullAssertion: -
      const districtId = districtIds[d.name]!;
      return { id, key, name, districtId };
    });
  });

  return [
    prisma.district.createMany({ data: districts, skipDuplicates: true }),
    prisma.locality.createMany({ data: localities, skipDuplicates: true }),
  ];
}
