import { prisma } from "#/db";
import { postRoute } from "#/utils";

export default postRoute("/network/olt/clear", null, () =>
  prisma.olt.deleteMany(),
);
