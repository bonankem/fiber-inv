import { appPlugin } from "#/utils";
import fhpAssignApi from "./fhp-assign.api";
import fhpCountApi from "./fhp-count.api";
import fhpGetImagesApi from "./fhp-get-images.api";
import fhpInitiateApi from "./fhp-initiate.api";
import fhpListApi from "./fhp-list.api";
import fhpPostImagesApi from "./fhp-post-images.api";
import fhpRequestApi from "./fhp-request.api";
import fhpReviewApi from "./fhp-review.api";
import fhpSubmitApi from "./fhp-submit.api";

export default appPlugin(async (app) => {
  app.register(fhpListApi);
  app.register(fhpCountApi);
  app.register(fhpGetImagesApi);

  app.register(fhpRequestApi);
  app.register(fhpAssignApi);
  app.register(fhpInitiateApi);
  app.register(fhpPostImagesApi);
  app.register(fhpSubmitApi);
  app.register(fhpReviewApi);
});
