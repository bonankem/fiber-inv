import { appPlugin } from "#/utils/routing";
import { fhpAssignApi } from "./fhp-assign.api";
import { fhpCountApi } from "./fhp-count.api";
import { fhpImagesApi } from "./fhp-images.api";
import { fhpInitiateApi } from "./fhp-initiate.api";
import { fhpListApi } from "./fhp-list.api";
import { fhpRequestApi } from "./fhp-request.api";
import { fhpReviewApi } from "./fhp-review.api";
import { fhpSubmitApi } from "./fhp-submit.api";

export default appPlugin((app) => {
  app.register(fhpAssignApi);
  app.register(fhpCountApi);
  app.register(fhpImagesApi);
  app.register(fhpInitiateApi);
  app.register(fhpListApi);
  app.register(fhpRequestApi);
  app.register(fhpReviewApi);
  app.register(fhpSubmitApi);
});
