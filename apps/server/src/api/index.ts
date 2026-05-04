import { appPlugin } from "#/utils";
import auth from "./auth";
import ftthSurveys from "./ftth-surveys";
import uploads from "./uploads";
import users from "./users";

export default appPlugin(async (app) => {
  app.register(auth);
  app.register(ftthSurveys);
  app.register(users);
  app.register(uploads);
});
