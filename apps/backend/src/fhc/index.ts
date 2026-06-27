import { appPlugin } from "#/utils/routing";
import { fhcCountApi } from "./fhc-count.api";
import { fhcListApi } from "./fhc-list.api";
import { fhcRequestApi } from "./fhc-request.api";
import { fhcUpdateApi } from "./fhc-update.api";

export default appPlugin((app) => {
  app.register(fhcCountApi);
  app.register(fhcListApi);
  app.register(fhcRequestApi);
  app.register(fhcUpdateApi);
});
