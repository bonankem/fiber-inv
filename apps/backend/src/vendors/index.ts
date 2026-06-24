import { appPlugin } from "#/utils";
import { createApi } from "./vnd-create.api";
import { listApi } from "./vnd-list.api";

export default appPlugin(async (app) => {
  app.register(listApi);
  app.register(createApi);
});
