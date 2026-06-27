import { appPlugin } from "#/utils/routing";
import { createApi } from "./usr-create.api";
import { getApi } from "./usr-get.api";
import { listApi } from "./usr-list.api";

export default appPlugin((app) => {
  app.register(getApi);
  app.register(listApi);
  app.register(createApi);
});
