import {
  CalendarOutlined,
  CloseOutlined,
  MessageOutlined,
  SendOutlined,
  StopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { m } from "i18n/messages";
import { ThumbsUp } from "lucide-react";
import { WorkStatus as When } from "schema/enums";
import type { FtthSurveyT as What } from "schema/fhs";
import { buildActions } from "#/components/actions/types";
import CommentForm from "../work/CommentForm";
import FhsAcceptForm from "./forms/FhsAcceptForm";
import FhsAssignForm from "./forms/FhsAssignForm";
import FhsDeclineForm from "./forms/FhsDeclineForm";
import FhsInitiateForm from "./forms/FhsInitiateForm";
import FhsRejectForm from "./forms/FhsRejectForm";
import FhsSubmitForm from "./forms/FhsSubmitForm";

function isWhen(what: What, when: When) {
  return what.work.status === when;
}

function isWho() {
  return true;
}

export const fhsActions = buildActions(isWhen, isWho, [
  {
    name: m.action_assign(),
    icon: UserOutlined,
    when: [When.REQUESTED],
    form: FhsAssignForm,
    main: true,
  },
  {
    name: m.action_decline(),
    icon: StopOutlined,
    when: [When.REQUESTED],
    form: FhsDeclineForm,
    main: true,
    red: true,
  },
  {
    name: m.action_initiate(),
    icon: CalendarOutlined,
    when: [When.ASSIGNED],
    form: FhsInitiateForm,
    main: true,
  },
  {
    name: m.action_submit(),
    icon: SendOutlined,
    when: [When.ONGOING],
    form: FhsSubmitForm,
    main: true,
  },
  {
    name: m.action_accept(),
    icon: ThumbsUp,
    when: [When.REVIEW],
    form: FhsAcceptForm,
    main: true,
  },
  {
    name: m.action_reject(),
    icon: CloseOutlined,
    when: [When.REVIEW],
    form: FhsRejectForm,
    main: true,
    red: true,
  },
  {
    name: m.action_comment(),
    icon: MessageOutlined,
    form: CommentForm,
  },
]);
