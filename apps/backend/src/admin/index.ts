import { Allow } from "#/auth/guard";
import { appPlugin, rbac } from "#/utils/routing";
import { authLogsApi } from "./adm-logs.api";
import { patchApi } from "./adm-patch.api";
import { getSecurityApi, setSecurityApi } from "./adm-security.api";
import { getSyslogApi, setSyslogApi } from "./adm-syslog.api";
import { unlockApi } from "./adm-unlock.api";
import { userInfoApi } from "./adm-users.api";

export default appPlugin((app) => {
  app.addHook("onRequest", rbac(Allow.ADMIN));

  app.register(authLogsApi);
  app.register(getSecurityApi);
  app.register(getSyslogApi);
  app.register(patchApi);
  app.register(setSecurityApi);
  app.register(setSyslogApi);
  app.register(unlockApi);
  app.register(userInfoApi);
});
