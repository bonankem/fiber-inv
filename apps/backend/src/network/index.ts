import { appPlugin } from "#/utils/routing";
import { boxListApi } from "./net-box-list.api";
import { oltListApi } from "./net-olt-list.api";

export default appPlugin((app) => {
  app.register(oltListApi);
  app.register(boxListApi);
});
