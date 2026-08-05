import { appPlugin } from "#/utils/routing";
import { netBoxesAddApi } from "./net-boxes-add.api";
import { netBoxesListApi } from "./net-boxes-list.api";
import { netOltsAddApi } from "./net-olts-add.api";
import { netOltsListApi } from "./net-olts-list.api";

export default appPlugin((app) => {
  app.register(netBoxesAddApi);
  app.register(netBoxesListApi);
  app.register(netOltsAddApi);
  app.register(netOltsListApi);
});
