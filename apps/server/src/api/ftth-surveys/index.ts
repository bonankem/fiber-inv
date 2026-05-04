import { appPlugin } from "#/utils";
import listApi from "./list.api";
import requestApi from "./request.api";

export default appPlugin(async (app) => {
  app.register(requestApi);
  app.register(listApi);
});
