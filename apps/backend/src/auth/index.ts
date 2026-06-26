import { appPlugin } from "#/utils";
import { authCron } from "./auth.cron";
import { changeApi } from "./auth-change.api";
import { chooseApi } from "./auth-choose.api";
import { forgotApi } from "./auth-forgot.api";
import { loginApi } from "./auth-login.api";
import { resetApi } from "./auth-reset.api";
import { resetCheckApi } from "./auth-reset-check.api";
import { verifyApi } from "./auth-verify.api";
import { Allow } from "./guard";

export default appPlugin(async (app) => {
  app.addHook("onRequest", async (req) => {
    // all auth endpoints are public
    req.allow = Allow.PUBLIC;
  });
  app.register(authCron);

  app.register(changeApi);
  app.register(chooseApi);
  app.register(forgotApi);
  app.register(loginApi);
  app.register(resetApi);
  app.register(resetCheckApi);
  app.register(verifyApi);
});
