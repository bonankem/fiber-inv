import { appPlugin } from "#/utils";
import changeApi from "./change.api";
import chooseApi from "./choose.api";
import loginApi from "./login.api";
import verifyApi from "./verify.api";

export default appPlugin(async (app) => {
  app.register(loginApi);
  app.register(changeApi);
  app.register(chooseApi);
  app.register(verifyApi);
});
