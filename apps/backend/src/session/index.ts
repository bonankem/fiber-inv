import { appPlugin } from "#/utils";
import logoutApi from "./logout.api";
import passwordApi from "./password.api";
import userApi from "./user.api";

export default appPlugin(async (app) => {
  app.register(userApi);
  app.register(logoutApi);
  app.register(passwordApi);
});
