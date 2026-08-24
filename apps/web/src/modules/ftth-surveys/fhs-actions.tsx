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
import { StaffRole, WorkStatus as When } from "schema/enums";
import type { FtthSurveyT as What } from "schema/fhs";
import type { UserFullT } from "schema/people";
import { buildActions } from "#/components/actions/types";
import CommentForm from "../work/CommentForm";
import FhsAcceptForm from "./forms/FhsAcceptForm";
import FhsAssignForm from "./forms/FhsAssignForm";
import FhsDeclineForm from "./forms/FhsDeclineForm";
import FhsInitiateForm from "./forms/FhsInitiateForm";
import FhsRejectForm from "./forms/FhsRejectForm";
import FhsSubmitForm from "./forms/FhsSubmitForm";

enum Whom {
  MANAGER = "manager",
  HANDLER = "handler",
  VENDOR = "vendor",
  ANY = "any",
}

function isWhen(what: What, when: When) {
  return what.work.status === when;
}

function isVendor(what: What, user: UserFullT) {
  const v = user.vendor?.id;
  return !!v && what.work.vendor?.id === v;
}

function isWhom(what: What, whom: Whom, user: UserFullT) {
  const isMe = (role: StaffRole) => {
    const worker = what.work.workers.find((w) => w.role === role);
    return !!worker && worker.user.id === user.id;
  };
  if (whom === Whom.ANY) return true;
  if (whom === Whom.MANAGER) return isMe(StaffRole.PLANNING_MANAGER);
  if (whom === Whom.HANDLER) return isMe(StaffRole.PLANNING_ENGINEER);
  if (whom === Whom.VENDOR) return isVendor(what, user);
  return false;
}

export const fhsActions = buildActions(isWhen, isWhom, [
  {
    name: m.action_assign(),
    icon: UserOutlined,
    when: [When.REQUESTED],
    whom: [Whom.MANAGER],
    form: FhsAssignForm,
    main: true,
  },
  {
    name: m.action_decline(),
    icon: StopOutlined,
    when: [When.REQUESTED],
    whom: [Whom.MANAGER],
    form: FhsDeclineForm,
    main: true,
    red: true,
  },
  {
    name: m.action_initiate(),
    icon: CalendarOutlined,
    when: [When.ASSIGNED],
    whom: [Whom.HANDLER],
    form: FhsInitiateForm,
    main: true,
  },
  {
    name: m.action_submit(),
    icon: SendOutlined,
    when: [When.SURVEY, When.FAILED_REVIEW],
    whom: [Whom.VENDOR],
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
