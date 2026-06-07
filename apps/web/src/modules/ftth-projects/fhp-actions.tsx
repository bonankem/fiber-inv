import {
  CalendarOutlined,
  CheckSquareOutlined,
  CloseOutlined,
  MessageOutlined,
  StopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { m } from "i18n/messages";
import { ThumbsUp } from "lucide-react";
import { WorkStatus as When } from "schema/enums";
import type { FtthProjectT as What } from "schema/fhp";
import { buildActions } from "#/components/actions/types";
import CommentForm from "../work/CommentForm";
import FhpAcceptForm from "./forms/FhpAcceptForm";
import FhpAssignForm from "./forms/FhpAssignForm";
import FhpInitiateForm from "./forms/FhpInitiateForm";
import FhpRejectForm from "./forms/FhpRejectForm";
import FhpSubmitForm from "./forms/FhpSubmitForm";

function isWhen(what: What, when: When) {
  return what.work.status === when;
}

function isWho() {
  return true;
}

export const fhpActions = buildActions(isWhen, isWho, [
  {
    name: m.action_assign(),
    icon: UserOutlined,
    when: [When.REQUESTED],
    form: FhpAssignForm,
    main: true,
  },
  {
    name: m.action_decline(),
    icon: StopOutlined,
    when: [When.REQUESTED],
    main: true,
    red: true,
  },
  {
    name: m.action_initiate(),
    icon: CalendarOutlined,
    when: [When.ASSIGNED],
    form: FhpInitiateForm,
    main: true,
  },
  {
    name: m.action_finish(),
    icon: CheckSquareOutlined,
    when: [When.ONGOING],
    form: FhpSubmitForm,
    main: true,
  },
  {
    name: m.action_accept(),
    icon: ThumbsUp,
    when: [When.REVIEW],
    form: FhpAcceptForm,
    main: true,
  },
  {
    name: m.action_reject(),
    icon: CloseOutlined,
    when: [When.REVIEW],
    form: FhpRejectForm,
    main: true,
    red: true,
  },
  {
    name: m.action_comment(),
    icon: MessageOutlined,
    form: CommentForm,
  },
]);
