import { indexBy, partition } from "remeda";
import {
  type OltCreateManyT,
  type OltCreateT,
  oltCreateManyZ,
  oltS,
} from "schema/equipment";
import { prisma } from "#/db";
import { bad, connectIdOrKey, postRoute } from "#/utils";
import { makeKey } from "../utils/queries";

export default postRoute(
  "/equipment/olt",
  () => oltCreateManyZ,
  (req) => oltCreate(req.body),
);

async function oltCreate(dto: OltCreateManyT) {
  const dtoItems: OltCreateT[] = [
    ...(dto.items ?? []),
    ...(dto.names?.map((name) => ({ name })) ?? []),
  ];
  if (!dtoItems.length) bad("Empty list");

  const items = dtoItems.map(({ ...i }) => ({
    ...i,
    key: makeKey(i.name),
    oem: connectIdOrKey(i.oem || dto.oem || bad(`No OEM for ${i.name}`)),
    mtnSite: i.mtnSite || /(?<![A-Za-z])CI\d{5}/.exec(i.name)?.[0],
  }));
  const db = prisma.olt;
  const existing = indexBy(await db.findMany(), (e) => e.key);
  const [newOlts, dupOlts] = partition(items, (i) => !existing[i.key]);

  const dup = dupOlts.length;
  if (dup && !dto.ignoreExisting) bad(`${dup} items already exist`);

  const todo = newOlts.map((data) => db.create({ data, select: oltS }));
  return prisma.$transaction(todo);
}
