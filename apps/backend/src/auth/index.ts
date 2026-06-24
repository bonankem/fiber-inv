import { appPlugin } from "#/utils";
import { changeApi } from "./change.api";
import { chooseApi } from "./choose.api";
import { forgotApi } from "./forgot.api";
import { Allow } from "./guard";
import { loginApi } from "./login.api";
import { resetApi } from "./reset.api";
import { resetCheckApi } from "./reset-check.api";
import { verifyApi } from "./verify.api";

export default appPlugin(async (app) => {
  app.addHook("onRequest", async (req) => {
    // all auth endpoints are public
    req.allow = Allow.PUBLIC;
  });
  app.register(loginApi);
  app.register(changeApi);
  app.register(chooseApi);
  app.register(verifyApi);
  app.register(forgotApi);
  app.register(resetApi);
  app.register(resetCheckApi);
});
