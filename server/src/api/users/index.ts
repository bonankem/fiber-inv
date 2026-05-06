import { appPlugin } from "#/utils";
import getApi from "./get.api";
import listApi from "./list.api";

export default appPlugin(async (app) => {
  app.register(getApi);
  app.register(listApi);
});
