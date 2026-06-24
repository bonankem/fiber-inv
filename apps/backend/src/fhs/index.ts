import { appPlugin } from "#/utils";
import { fhsAssignApi } from "./fhs-assign.api";
import { fhsCommentApi } from "./fhs-comment.api";
import { fhsCountApi } from "./fhs-count.api";
import { fhsDeclineApi } from "./fhs-decline.api";
import { fhsForProjectApi } from "./fhs-for-project.api";
import { fhsGetApi } from "./fhs-get.api";
import { fhsInitiateApi } from "./fhs-initiate.api";
import { fhsListApi } from "./fhs-list.api";
import { fhsLogsApi } from "./fhs-logs.api";
import { fhsRequestApi } from "./fhs-request.api";
import { fhsReviewApi } from "./fhs-review.api";
import { fhsSubmitApi } from "./fhs-submit.api";

export default appPlugin(async (app) => {
  app.register(fhsAssignApi);
  app.register(fhsCommentApi);
  app.register(fhsCountApi);
  app.register(fhsDeclineApi);
  app.register(fhsForProjectApi);
  app.register(fhsGetApi);
  app.register(fhsInitiateApi);
  app.register(fhsListApi);
  app.register(fhsLogsApi);
  app.register(fhsRequestApi);
  app.register(fhsReviewApi);
  app.register(fhsSubmitApi);
});
