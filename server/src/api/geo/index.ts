import { appPlugin } from "#/utils";
import districtsApi from "./districts.api";
import saveApi from "./save.api";

export default appPlugin(async (app) => {
  app.register(districtsApi);
  app.register(saveApi);
});
