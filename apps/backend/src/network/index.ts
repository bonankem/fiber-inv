import { appPlugin } from "#/utils/routing";
import { fatAddApi, fatListApi } from "./fat-api";
import { oltAddApi, oltListApi } from "./olt-api";

export default appPlugin((app) => {
  app.register(fatAddApi);
  app.register(fatListApi);
  app.register(oltAddApi);
  app.register(oltListApi);
});
