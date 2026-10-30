import { appPlugin, rbac } from "#/utils/routing";
import admin from "./admin";
import auth from "./auth";
import { Allow, authGuard } from "./auth/guard";
import fhc from "./fhc";
import fhp from "./fhp";
import fhs from "./fhs";
import fiberInventory from "./fiber-inventory";
import geo from "./geo";
import inventory from "./inventory";
import network from "./network";
import session from "./session";
import setup from "./setup";
import uploads from "./uploads";
import users from "./users";
import vendors from "./vendors";
import work from "./work";

export default appPlugin((app) => {
  app.register(authGuard);

  app.get(
    "/", // for health checks
    { onRequest: rbac(Allow.PUBLIC) },
    () => ({ name: "ServiceX" }),
  );

  app.register(admin);
  app.register(auth);
  app.register(fhc);
  app.register(fhp);
  app.register(fhs);
  app.register(fiberInventory);
  app.register(geo);
  app.register(inventory);
  app.register(network);
  app.register(session);
  app.register(setup);
  app.register(uploads);
  app.register(users);
  app.register(vendors);
  app.register(work);
});
