import { Allow } from "#/auth/guard";
import { appPlugin } from "#/utils";
import { authLogsAoi } from "./auth-logs.api";
import { patchApi } from "./patch.api";
import { getSecurityApi, setSecurityApi } from "./security.api";
import { getSyslogApi, setSyslogApi } from "./syslog.api";
import { unlockApi } from "./unlock.api";
import { userInfoApi } from "./user-info.api";

export default appPlugin(async (app) => {
  app.addHook("onRequest", async (req) => {
    req.allow = Allow.ADMIN;
  });
  app.register(authLogsAoi);
  app.register(getSecurityApi);
  app.register(getSyslogApi);
  app.register(patchApi);
  app.register(setSecurityApi);
  app.register(setSyslogApi);
  app.register(unlockApi);
  app.register(userInfoApi);
});
