import { appPlugin } from "#/utils/routing";
import { geoDistrictsApi } from "./geo-districts.api";
import { geoInitializeApi } from "./geo-initialize.api";
import { geoLocalitiesApi } from "./geo-localities.api";

export default appPlugin((app) => {
  app.register(geoDistrictsApi);
  app.register(geoLocalitiesApi);
  app.register(geoInitializeApi);
});
