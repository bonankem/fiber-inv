import { appPlugin } from "#/utils";
import { oltListApi } from "./net-olt-list.api";

export default appPlugin(async (app) => {
  app.register(oltListApi);
});
