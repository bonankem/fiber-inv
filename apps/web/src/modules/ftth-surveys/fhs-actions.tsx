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
import FhsSubmitBomForm from "./forms/FhsSubmitBomForm";
import FhsSubmitPartingForm from "./forms/FhsSubmitPartingForm";
import FhsSubmitSizingForm from "./forms/FhsSubmitSizingForm";
import FhsSubmitTallyForm from "./forms/FhsSubmitTallyForm";

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
    when: [When.TALLYING, When.TALLYING_REJECTED],
    whom: [Whom.VENDOR],
    form: FhsSubmitTallyForm,
    main: true,
  },
  {
    name: m.action_submit(),
    icon: SendOutlined,
    when: [When.PARTING, When.PARTING_REJECTED],
    whom: [Whom.VENDOR],
    form: FhsSubmitPartingForm,
    main: true,
  },
  {
    name: m.action_submit(),
    icon: SendOutlined,
    when: [When.SIZING, When.SIZING_REJECTED],
    whom: [Whom.VENDOR],
    form: FhsSubmitSizingForm,
    main: true,
  },
  {
    name: m.action_submit(),
    icon: SendOutlined,
    when: [When.BOM, When.BOM_REJECTED],
    whom: [Whom.VENDOR],
    form: FhsSubmitBomForm,
    main: true,
  },
  {
    name: m.action_accept(),
    icon: ThumbsUp,
    when: [
      When.TALLYING_VALIDATION,
      When.PARTING_VALIDATION,
      When.SIZING_VALIDATION,
      When.BOM_VALIDATION,
    ],
    whom: [Whom.HANDLER],
    form: FhsAcceptForm,
    main: true,
  },
  {
    name: m.action_reject(),
    icon: CloseOutlined,
    when: [
      When.TALLYING_VALIDATION,
      When.PARTING_VALIDATION,
      When.SIZING_VALIDATION,
      When.BOM_VALIDATION,
    ],
    whom: [Whom.HANDLER],
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
