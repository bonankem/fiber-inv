import { appPlugin, rbac } from "#/utils/routing";
import admin from "./admin";
import auth from "./auth";
import { Allow, authGuard } from "./auth/guard";
import fhc from "./fhc";
import fhp from "./fhp";
import fhs from "./fhs";
import geo from "./geo";
import network from "./network";
import session from "./session";
import setup from "./setup";
import uploads from "./uploads";
import users from "./users";
import vendors from "./vendors";
import work from "./work";

export default appPlugin((app) => {
  app.register(authGuard);

  app.get("/", { onRequest: rbac(Allow.PUBLIC) }, () => ({ name: "ServiceX" }));

  app.register(admin);
  app.register(auth);
  app.register(work);
  app.register(fhp);
  app.register(fhs);
  app.register(fhc);
  app.register(geo);
  app.register(users);
  app.register(session);
  app.register(vendors);
  app.register(uploads);
  app.register(network);
  app.register(setup);
});
