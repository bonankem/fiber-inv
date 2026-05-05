import { appPlugin } from "#/utils";
import clearApi from "./clear.api";
import createApi from "./create.api";
import getApi from "./get.api";
import listApi from "./list.api";

export default appPlugin(async (app) => {
  app.register(clearApi);
  app.register(createApi);
  app.register(listApi);
  app.register(getApi);
});
