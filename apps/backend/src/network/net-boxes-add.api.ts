import { bad, Err } from "schema/errors";
import { type BoxAddManyT, boxAddManyZ } from "schema/network";
import { BoxType, prisma } from "#/db";
import { postRoute } from "#/utils/routing";

export const netBoxesAddApi = postRoute({
  url: "/network/boxes",
  schema: boxAddManyZ,
  handler: (req) => netBoxesAdd(req.body),
});

const VALID_BOX = /^(\w{5,6})_X\d+(_H\d+(?:_([SE])\d+)?)?$/;

async function netBoxesAdd(dto: BoxAddManyT) {
  const data = dto.items.map(({ name }) => {
    const match = VALID_BOX.exec(name);
    if (!match) bad(Err.INVALID_NAME, name);

    const type =
      (match[3] === "S" && BoxType.SUB) ||
      (match[3] === "E" && BoxType.END) ||
      (match[2] ? BoxType.HUB : BoxType.X);
    return { name, type, area: match[1] };
  });
  return prisma.ftthBox.createMany({
    data,
    skipDuplicates: true,
  });
}
