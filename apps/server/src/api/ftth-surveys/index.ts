import { appPlugin } from "#/utils";
import assignEngineerApi from "./engineer.api";
import getApi from "./get.api";
import listApi from "./list.api";
import logsApi from "./logs.api";
import requestApi from "./request.api";
import assignVendorApi from "./vendor.api";

export default appPlugin(async (app) => {
  app.register(listApi);
  app.register(getApi);
  app.register(logsApi);

  app.register(requestApi);
  app.register(assignEngineerApi);
  app.register(assignVendorApi);
});
