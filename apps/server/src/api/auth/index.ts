import { appPlugin } from "#/utils";
import loginApi from "./login.api";

export default appPlugin(async (app) => {
  app.register(loginApi);
});
