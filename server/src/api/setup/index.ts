import { appPlugin } from "#/utils";
import localitiesApi from "./localities.api";
import seedApi from "./seed.api";
import wipeApi from "./wipe.api";

export default appPlugin(async (app) => {
  app.register(wipeApi);
  app.register(seedApi);
  app.register(localitiesApi);
});
