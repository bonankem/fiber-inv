import { appPlugin } from "#/utils";
import { logoutApi } from "./ssn-logout.api";
import { passwordApi } from "./ssn-password.api";
import { userApi } from "./ssn-user.api";

export default appPlugin(async (app) => {
  app.register(userApi);
  app.register(logoutApi);
  app.register(passwordApi);
});
