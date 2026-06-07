import { appPlugin } from "#/utils";
import oltListApi from "./olt-list.api";

export default appPlugin(async (app) => {
  app.register(oltListApi);
});
