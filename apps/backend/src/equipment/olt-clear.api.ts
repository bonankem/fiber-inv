import { prisma } from "#/prisma";
import { postRoute } from "#/utils";

export default postRoute("/equipment/olt/clear", null, () =>
  prisma.olt.deleteMany(),
);
