import { appPlugin } from "#/utils";
import getApi from "./get.api";
import listApi from "./list.api";
import seedApi from "./seed.api";

export default appPlugin(async (app) => {
  app.register(getApi);
  app.register(listApi);
  app.register(seedApi);
});
