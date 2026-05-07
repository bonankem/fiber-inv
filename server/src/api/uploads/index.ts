import { appPlugin } from "#/utils";
import cleanupApi from "./cleanup.api";
import createApi from "./create.api";
import getApi from "./get.api";
import listApi from "./list.api";

export default appPlugin(async (app) => {
  app.register(createApi);
  app.register(cleanupApi);
  app.register(listApi);
  app.register(getApi);
});
