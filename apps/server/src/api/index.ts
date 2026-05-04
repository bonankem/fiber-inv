import { appPlugin } from "#/utils";
import authLogin from "./auth/login.api";
import uploadsClear from "./uploads/clear.api";
import uploadsCreate from "./uploads/create.api";
import uploadsGet from "./uploads/get.api";
import uploadsList from "./uploads/list.api";
import usersGet from "./users/get.api";
import usersList from "./users/list.api";
import usersSeed from "./users/seed.api";

export default appPlugin(async (app) => {
  app.register(authLogin);

  app.register(usersSeed);
  app.register(usersList);
  app.register(usersGet);

  app.register(uploadsCreate);
  app.register(uploadsClear);
  app.register(uploadsList);
  app.register(uploadsGet);
});
