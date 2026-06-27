import { appPlugin } from "#/utils/routing";
import { createApi } from "./vnd-create.api";
import { listApi } from "./vnd-list.api";

export default appPlugin((app) => {
  app.register(listApi);
  app.register(createApi);
});
