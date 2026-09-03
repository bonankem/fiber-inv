import { appPlugin } from "#/utils/routing";
import { fhcAtpFailApi } from "./fhc-atp-fail.api";
import { fhcAtpPassApi } from "./fhc-atp-pass.api";
import { fhcConfigApi } from "./fhc-config.api";
import { fhcCostGetApi } from "./fhc-cost.api";
import { fhcCountApi } from "./fhc-count.api";
import { fhcExtractApi } from "./fhc-extract.api";
import { fhcListApi } from "./fhc-list.api";
import { fhcRequestManyApi } from "./fhc-many.api";
import {
  fhcPbDeleteApi,
  fhcPbListApi,
  fhcPbUpdateApi,
} from "./fhc-pricebook.api";
import { fhcRequestApi } from "./fhc-request.api";
import { fhcReviewApi } from "./fhc-review.api";
import { fhcStatusApi } from "./fhc-status-api";
import { fhcSubmitApi } from "./fhc-submit.api";
import { fhcSurveyApi } from "./fhc-survey.api";

export default appPlugin((app) => {
  app.register(fhcAtpFailApi);
  app.register(fhcAtpPassApi);
  app.register(fhcConfigApi);
  app.register(fhcCostGetApi);
  app.register(fhcCountApi);
  app.register(fhcExtractApi);
  app.register(fhcListApi);
  app.register(fhcPbDeleteApi);
  app.register(fhcPbListApi);
  app.register(fhcPbUpdateApi);
  app.register(fhcRequestApi);
  app.register(fhcRequestManyApi);
  app.register(fhcReviewApi);
  app.register(fhcSubmitApi);
  app.register(fhcStatusApi);
  app.register(fhcSurveyApi);
});
