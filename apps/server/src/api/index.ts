import { appPlugin } from "#/utils";
import auth from "./auth";
import fhs from "./ftth-surveys";
import geo from "./geo";
import uploads from "./uploads";
import users from "./users";

export default appPlugin(async (app) => {
  app.register(auth);
  app.register(fhs);
  app.register(geo);
  app.register(users);
  app.register(uploads);
});
