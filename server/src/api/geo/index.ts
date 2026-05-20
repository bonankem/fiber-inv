import { appPlugin } from "#/utils";
import geoDistrictsApi from "./geo-districts.api";
import geoInitializeApi from "./geo-initialize.api";

export default appPlugin(async (app) => {
  app.register(geoDistrictsApi);
  app.register(geoInitializeApi);
});
