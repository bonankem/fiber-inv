import { appPlugin } from "#/utils";
import oltClearApi from "./olt-clear.api";
import oltCreateApi from "./olt-create.api";
import oltListApi from "./olt-list.api";

export default appPlugin(async (app) => {
  app.register(oltListApi);
  app.register(oltCreateApi);
  app.register(oltClearApi);
});
