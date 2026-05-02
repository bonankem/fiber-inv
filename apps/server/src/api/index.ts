import { appPlugin } from "#/utils";
import authLogin from "./auth/login.api";
import usersSeed from "./users/seed.api";

export default appPlugin(async (app) => {
  app.register(authLogin);
  app.register(usersSeed);
});
