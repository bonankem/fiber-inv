import { appPlugin } from "#/utils";
import auth from "./auth";
import fhp from "./fhp";
import fhs from "./fhs";
import geo from "./geo";
import setup from "./setup";
import uploads from "./uploads";
import users from "./users";
import vendors from "./vendors";

export default appPlugin(async (app) => {
  app.register(auth);
  app.register(fhp);
  app.register(fhs);
  app.register(geo);
  app.register(users);
  app.register(vendors);
  app.register(uploads);
  app.register(setup);
});
