import { appPlugin } from "#/utils";
import auth from "./auth";
import fhs from "./ftth-surveys";
import geo from "./geo";
import setup from "./setup";
import uploads from "./uploads";
import users from "./users";
import vendors from "./vendors";

export default appPlugin(async (app) => {
  app.register(auth);
  app.register(fhs);
  app.register(geo);
  app.register(users);
  app.register(vendors);
  app.register(uploads);
  app.register(setup);
});
