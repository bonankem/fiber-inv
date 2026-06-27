import { prisma } from "#/db";
import { appPlugin } from "#/utils/routing";
import { logoutApi } from "./ssn-logout.api";
import { passwordApi } from "./ssn-password.api";
import { userApi } from "./ssn-user.api";

export default appPlugin((app) => {
  app.register(userApi);
  app.register(logoutApi);
  app.register(passwordApi);

  app.addHook("onResponse", async (req, reply) => {
    const user = req.maybeUser;
    const code = reply.statusCode;
    if (!user || code === 401) return;

    app.log.info(`Activity for ${user.name}`);
    prisma.user
      .update({
        where: { id: user.id },
        data: { lastActive: new Date() },
      })
      .catch(() => {});
  });
});
