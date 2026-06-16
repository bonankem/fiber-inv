import { Allow } from "#/auth/guard";
import { appPlugin } from "#/utils";
import getAuthLogsApi from "./get-auth-logs.api";
import getSecurityApi from "./get-security.api";
import setSecurityApi from "./set-security.api";
import userInfoApi from "./user-info.api";

export default appPlugin(async (app) => {
  app.addHook("onRequest", async (req) => {
    req.allow = Allow.ADMIN;
  });
  app.register(getSecurityApi);
  app.register(setSecurityApi);
  app.register(userInfoApi);
  app.register(getAuthLogsApi);
});
