import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  MessageOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { m } from "i18n/messages";
import { StaffRole, WorkStatus as When } from "schema/enums";
import type { FtthConnectionT as What } from "schema/fhc";
import { buildActions, isWhom, VENDOR } from "#/components/actions/types";
import CommentForm from "../work/CommentForm";
import FhcAcceptForm from "./forms/FhcAcceptForm";
import FhcRejectForm from "./forms/FhcRejectForm";
import FhcStatusForm from "./forms/FhcStatusForm";
import FhcSubmitForm from "./forms/FhcSubmitForm";
import FhcSurveyForm from "./forms/FhcSurveyForm";

function isWhen(what: What, when: When) {
  return what.work.status === when;
}

const { HOME_INTERNET } = StaffRole;

export const fhcActions = buildActions(isWhen, isWhom<What>, [
  {
    name: m.finish_survey(),
    icon: SendOutlined,
    when: [When.SURVEY],
    form: FhcSurveyForm,
    whom: [VENDOR],
    main: true,
  },
  {
    name: "Update Status",
    icon: ClockCircleOutlined,
    form: FhcStatusForm,
    when: [When.DESATURATION, When.BUILDING_CABLING],
    whom: [VENDOR],
    main: true,
  },
  {
    name: m.action_submit(),
    icon: SendOutlined,
    form: FhcSubmitForm,
    when: [When.INSTALLATION, When.FAILED_REVIEW],
    whom: [HOME_INTERNET],
    main: true,
  },
  {
    name: m.action_accept(),
    icon: CheckOutlined,
    form: FhcAcceptForm,
    when: [When.REVIEW],
    whom: [HOME_INTERNET],
    main: true,
  },
  {
    name: m.action_reject(),
    icon: CloseOutlined,
    form: FhcRejectForm,
    when: [When.REVIEW],
    whom: [HOME_INTERNET],
    main: true,
    red: true,
  },
  {
    name: m.action_comment(),
    icon: MessageOutlined,
    form: CommentForm,
  },
]);
