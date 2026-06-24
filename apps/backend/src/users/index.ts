import { appPlugin } from "#/utils";
import { createApi } from "./usr-create.api";
import { getApi } from "./usr-get.api";
import { listApi } from "./usr-list.api";

export default appPlugin(async (app) => {
  app.register(getApi);
  app.register(listApi);
  app.register(createApi);
});
