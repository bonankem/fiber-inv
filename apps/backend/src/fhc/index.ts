import { appPlugin } from "#/utils/routing";
import { fhcCountApi } from "./fhc-count.api";
import { fhcExtractApi } from "./fhc-extract.api";
import { fhcListApi } from "./fhc-list.api";
import { fhcRequestManyApi } from "./fhc-many.api";
import { fhcRequestApi } from "./fhc-request.api";
import { fhcUpdateApi } from "./fhc-update.api";

export default appPlugin((app) => {
  app.register(fhcCountApi);
  app.register(fhcExtractApi);
  app.register(fhcListApi);
  app.register(fhcRequestApi);
  app.register(fhcRequestManyApi);
  app.register(fhcUpdateApi);
});
