import { appPlugin } from "#/utils";
import loginRoute from "./auth/login.route";
import seedRoute from "./users/seed.route";

export default appPlugin(async (app) => {
  app.register(loginRoute);
  app.register(seedRoute);
});
