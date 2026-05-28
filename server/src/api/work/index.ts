import { appPlugin } from "#/utils";
import workDocsApi from "./work-docs.api";
import workLogsApi from "./work-logs.api";

export default appPlugin(async (app) => {
  app.register(workLogsApi);
  app.register(workDocsApi);
});
