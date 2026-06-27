import { appPlugin } from "#/utils/routing";
import workDocsApi from "./work-docs.api";
import workLogsApi from "./work-logs.api";

export default appPlugin((app) => {
  app.register(workLogsApi);
  app.register(workDocsApi);
});
