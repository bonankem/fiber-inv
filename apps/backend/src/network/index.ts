import { appPlugin } from "#/utils/routing";
import { oltListApi } from "./net-olt-list.api";

export default appPlugin((app) => {
  app.register(oltListApi);
});
