import { appPlugin } from "#/utils/routing";
import { cleanupApi } from "./upl-cleanup.api";
import { createApi } from "./upl-create.api";
import { downloadApi } from "./upl-download.api";
import { getApi } from "./upl-get.api";
import { listApi } from "./upl-list.api";

export default appPlugin((app) => {
  app.register(cleanupApi);
  app.register(createApi);
  app.register(downloadApi);
  app.register(getApi);
  app.register(listApi);
});
