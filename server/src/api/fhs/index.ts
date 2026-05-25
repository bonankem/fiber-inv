import { appPlugin } from "#/utils";
import fhsAssignApi from "./fhs-assign.api";
import fhsCommentApi from "./fhs-comment.api";
import fhsCountApi from "./fhs-count.api";
import fhsForProjectApi from "./fhs-for-project.api";
import fhsGetApi from "./fhs-get.api";
import fhsInitiateApi from "./fhs-initiate.api";
import fhsListApi from "./fhs-list.api";
import fhsLogsApi from "./fhs-logs.api";
import fhsRequestApi from "./fhs-request.api";
import fhsReviewApi from "./fhs-review.api";
import fhsSubmitApi from "./fhs-submit.api";

export default appPlugin(async (app) => {
  app.register(fhsListApi);
  app.register(fhsLogsApi);
  app.register(fhsCountApi);
  app.register(fhsForProjectApi);
  app.register(fhsGetApi);

  app.register(fhsRequestApi);
  app.register(fhsAssignApi);
  app.register(fhsInitiateApi);
  app.register(fhsSubmitApi);
  app.register(fhsReviewApi);
  app.register(fhsCommentApi);
});
