import { appPlugin } from "#/utils";
import authLogin from "./auth/login.api";
import usersGet from "./users/get.api";
import usersList from "./users/list.api";
import usersSeed from "./users/seed.api";

export default appPlugin(async (app) => {
  app.register(authLogin);

  app.register(usersSeed);
  app.register(usersList);
  app.register(usersGet);
});
