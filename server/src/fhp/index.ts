import { appPlugin } from "#/utils";
import fhpAssignApi from "./fhp-assign.api";
import fhpCountApi from "./fhp-count.api";
import fhpInitiateApi from "./fhp-initiate.api";
import fhpListApi from "./fhp-list.api";
import fhpRequestApi from "./fhp-request.api";
import fhpReviewApi from "./fhp-review.api";
import fhpSubmitApi from "./fhp-submit.api";

export default appPlugin(async (app) => {
  app.register(fhpListApi);
  app.register(fhpCountApi);

  app.register(fhpRequestApi);
  app.register(fhpAssignApi);
  app.register(fhpInitiateApi);
  app.register(fhpSubmitApi);
  app.register(fhpReviewApi);
});
