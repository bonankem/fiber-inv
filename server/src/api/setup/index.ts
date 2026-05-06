import { appPlugin } from "#/utils";
import seedApi from "./seed.api";
import wipeApi from "./wipe.api";

export default appPlugin(async (app) => {
  app.register(seedApi);
  app.register(wipeApi);
});
