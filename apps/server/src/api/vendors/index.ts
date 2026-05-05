import { appPlugin } from "#/utils";
import createApi from "./create.api";
import listApi from "./list.api";

export default appPlugin(async (app) => {
  app.register(listApi);
  app.register(createApi);
});
