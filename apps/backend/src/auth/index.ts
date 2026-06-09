import { appPlugin } from "#/utils";
import changeApi from "./change.api";
import chooseApi from "./choose.api";
import { Allow } from "./guard";
import loginApi from "./login.api";
import logoutApi from "./logout.api";
import authUserApi from "./user.api";
import verifyApi from "./verify.api";

export default appPlugin(async (app) => {
  app.addHook("onRequest", async (req) => {
    // all auth endpoints are public by default
    req.allow = Allow.PUBLIC;
  });
  app.register(loginApi);
  app.register(changeApi);
  app.register(chooseApi);
  app.register(verifyApi);
  app.register(logoutApi);
  app.register(authUserApi);
});
