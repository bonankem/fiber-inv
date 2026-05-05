import { prisma } from "#/prisma";
import { appRoute } from "#/utils";

export default appRoute(() => ({
  url: "/uploads",
  method: "DELETE",
  handler: () => prisma.upload.deleteMany(),
}));
