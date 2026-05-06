import { appPlugin } from "#/utils";
import districtsApi from "./districts.api";

export default appPlugin(async (app) => {
  app.register(districtsApi);
});
