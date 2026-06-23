import { Allow } from "#/auth/guard";
import { appPlugin } from "#/utils";
import getAuthLogsApi from "./auth-logs.api";
import { patchApi } from "./patch.api";
import { getSecurityApi, setSecurityApi } from "./security.api";
import { getSyslogApi, setSyslogApi } from "./syslog.api";
import userInfoApi from "./user-info.api";

export default appPlugin(async (app) => {
  app.addHook("onRequest", async (req) => {
    req.allow = Allow.ADMIN;
  });
  app.register(getSecurityApi);
  app.register(setSecurityApi);
  app.register(getSyslogApi);
  app.register(setSyslogApi);
  app.register(userInfoApi);
  app.register(getAuthLogsApi);
  app.register(patchApi);
});
