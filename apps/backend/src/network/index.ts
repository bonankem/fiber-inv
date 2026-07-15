import { appPlugin } from "#/utils/routing";
import { boxesApi } from "./net-boxes.api";
import { netListApi } from "./net-list";

export default appPlugin((app) => {
  app.register(boxesApi);
  app.register(netListApi);
});
