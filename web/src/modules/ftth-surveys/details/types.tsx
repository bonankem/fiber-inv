import type { FtthSurveyFullT, FtthSurveyT } from "schema/fhs";

export type FhsTabProps = {
  item: FtthSurveyT;
  full: FtthSurveyFullT | undefined;
  loading: boolean;
};
