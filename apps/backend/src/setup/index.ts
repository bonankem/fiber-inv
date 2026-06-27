import { appPlugin } from "#/utils/routing";
import { seedApi } from "./seed.api";
import { wipeApi } from "./wipe.api";

export default appPlugin((app) => {
  app.register(wipeApi);
  app.register(seedApi);
});
