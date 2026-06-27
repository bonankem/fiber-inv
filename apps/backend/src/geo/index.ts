import { appPlugin } from "#/utils/routing";
import { geoDistrictsApi } from "./geo-districts.api";
import { geoInitializeApi } from "./geo-initialize.api";

export default appPlugin((app) => {
  app.register(geoDistrictsApi);
  app.register(geoInitializeApi);
});
