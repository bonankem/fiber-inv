import { appPlugin } from "#/utils";
import auth from "./auth";
import { authGuard } from "./auth/guard";
import equipment from "./equipment";
import fhc from "./fhc";
import fhp from "./fhp";
import fhs from "./fhs";
import geo from "./geo";
import setup from "./setup";
import uploads from "./uploads";
import users from "./users";
import vendors from "./vendors";
import work from "./work";

export default appPlugin(async (app) => {
  app.register(authGuard);

  app.register(auth);
  app.register(work);
  app.register(fhp);
  app.register(fhs);
  app.register(fhc);
  app.register(geo);
  app.register(users);
  app.register(vendors);
  app.register(uploads);
  app.register(equipment);
  app.register(setup);
});
