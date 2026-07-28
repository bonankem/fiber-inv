import {
  CheckOutlined,
  CloseOutlined,
  MessageOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { m } from "i18n/messages";
import { WorkStatus as When } from "schema/enums";
import type { FtthConnectionT as What } from "schema/fhc";
import { buildActions } from "#/components/actions/types";
import CommentForm from "../work/CommentForm";
import FhcAcceptForm from "./forms/FhcAcceptForm";
import FhcRejectForm from "./forms/FhcRejectForm";
import FhcSubmitForm from "./forms/FhcSubmitForm";
import FhcSurveyForm from "./forms/FhcSurveyForm";

function isWhen(what: What, when: When) {
  return what.work.status === when;
}

function isWho() {
  return true;
}

export const fhcActions = buildActions(isWhen, isWho, [
  {
    name: m.finish_survey(),
    icon: SendOutlined,
    when: [When.SURVEY],
    form: FhcSurveyForm,
    main: true,
  },
  {
    name: m.action_finish(),
    icon: SendOutlined,
    form: FhcSubmitForm,
    when: [When.INSTALLATION, When.FAILED],
    main: true,
  },
  {
    name: m.action_accept(),
    icon: CheckOutlined,
    main: true,
    when: [When.REVIEW],
    form: FhcAcceptForm,
  },
  {
    name: m.action_reject(),
    icon: CloseOutlined,
    main: true,
    red: true,
    when: [When.REVIEW],
    form: FhcRejectForm,
  },
  {
    name: m.action_comment(),
    icon: MessageOutlined,
    form: CommentForm,
  },
]);
