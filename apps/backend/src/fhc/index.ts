import { appPlugin } from "#/utils";
import fhcCountApi from "./fhc-count.api";
import fhcListApi from "./fhc-list.api";
import fhcRequestApi from "./fhc-request.api";
import fhcUpdateApi from "./fhc-update.api";

export default appPlugin(async (app) => {
  app.register(fhcListApi);
  app.register(fhcCountApi);

  app.register(fhcRequestApi);
  app.register(fhcUpdateApi);
});
