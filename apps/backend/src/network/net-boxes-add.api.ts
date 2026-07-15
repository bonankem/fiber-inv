import { unique } from "remeda";
import { bad, Err } from "schema/errors";
import { type BoxAddManyT, boxAddManyZ } from "schema/network";
import { assoc, filterTruthy } from "schema/utils";
import { BoxType, prisma } from "#/db";
import { idOrKey } from "#/utils/ids";
import { postRoute } from "#/utils/routing";

export const netBoxesAddApi = postRoute({
  url: "/net/boxes",
  schema: boxAddManyZ,
  handler: (req) => netBoxesAdd(req.body),
});

const VALID_BOX = /^(\w{5})_X\d+(_H\d+(?:_([SE])\d+)?)?$/;
function boxTypeAndArea(name: string) {
  const m = VALID_BOX.exec(name);
  if (!m) bad(Err.INVALID_NAME, name);
  const code = m[1];
  const type =
    (m[3] === "S" && BoxType.SUB) ||
    (m[3] === "E" && BoxType.END) ||
    (m[2] && BoxType.HUB) ||
    BoxType.X;
  return { code, type };
}

async function netBoxesAdd(dto: BoxAddManyT) {
  const mainOlt = dto.olt
    ? await prisma.olt.findFirstOrThrow({ where: idOrKey(dto.olt) })
    : undefined;

  const mainOem = dto.oem
    ? await prisma.oem.findFirstOrThrow({ where: idOrKey(dto.oem) })
    : undefined;

  const items = dto.items.map((i) => {
    const { name, coords } = i;
    const { type, code } = boxTypeAndArea(name);
    const oltId = i.oltId || mainOlt?.id;
    const oemId = i.oemId || mainOem?.id;
    return { name, type, code, coords, oltId, oemId };
  });

  const codes = unique(filterTruthy(items.map((i) => i.code)));

  return prisma.$transaction(async (tx) => {
    const updateAreas = codes.map((code) =>
      tx.ftthArea.upsert({
        where: { code },
        update: {},
        create: { code, locality: { connect: { abbr: code.slice(0, 3) } } },
        select: { id: true, code: true },
      }),
    );
    const areas = assoc(
      await Promise.all(updateAreas),
      (a) => a.code,
      (a) => a.id,
    ) as Record<string, string>;
    return prisma.ftthBox.createMany({
      data: items.map(({ code, ...i }) => ({ areaId: areas[code], ...i })),
      skipDuplicates: true,
    });
  });
}
