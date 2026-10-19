import { m } from "i18n/messages";
import type { WorkAction } from "schema/enums";

export const workLogTitles: Record<WorkAction, string> = {
  REQUEST: m.log_request(),
  DECLINE: m.log_decline(),
  ASSIGN: m.log_assign(),
  INITIATE: m.log_initiate(),
  SUBMIT_TALLYING: m.log_submit_tallying(),
  SUBMIT_PARTING: m.log_submit_parting(),
  SUBMIT_SIZING: m.log_submit_sizing(),
  SUBMIT_BOM: m.log_submit_bom(),
  VALIDATE: m.log_validate(),
  REJECT: m.log_reject(),
  COMMENT: m.log_comment(),
  UPDATE: m.log_update(),
  FINISH_SURVEY: m.log_finish_survey(),
  UPDATE_STATUS: m.log_update_status(),
  UPLOAD_IMAGES: m.log_upload_images(),
  SUBMIT_REPORT: m.log_submit_report(),
  RESEND_REPORT: m.log_resend_report(),
  FAIL_REVIEW: m.log_fail_review(),
  PASS_REVIEW: m.log_pass_review(),
  CONFIGURATION: m.log_configuration(),
  PASS_FIELD_ATP: m.log_pass_field_atp(),
  FAIL_FIELD_ATP: m.log_fail_field_atp(),
};
