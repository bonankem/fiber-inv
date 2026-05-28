import {
  CalendarOutlined,
  CloseOutlined,
  MessageOutlined,
  SendOutlined,
  StopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ThumbsUp } from "lucide-react";
import { WorkStatus as When } from "schema/enums";
import type { FtthSurveyT as What } from "schema/fhs";
import { buildActions } from "#/components/actions/types";
import FhsAcceptForm from "./forms/FhsAcceptForm";
import FhsAssignForm from "./forms/FhsAssignForm";
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
    name: "Assign",
    icon: UserOutlined,
    when: [When.REQUESTED],
    form: FhsAssignForm,
    main: true,
  },
  {
    name: "Decline",
    icon: StopOutlined,
    when: [When.REQUESTED],
    main: true,
    red: true,
  },
  {
    name: "Initiate",
    icon: CalendarOutlined,
    when: [When.ASSIGNED],
    form: FhsInitiateForm,
    main: true,
  },
  {
    name: "Submit",
    icon: SendOutlined,
    when: [When.ONGOING],
    form: FhsSubmitForm,
    main: true,
  },
  {
    name: "Accepter",
    icon: ThumbsUp,
    when: [When.REVIEW],
    form: FhsAcceptForm,
    main: true,
  },
  {
    name: "Rejeter",
    icon: CloseOutlined,
    when: [When.REVIEW],
    form: FhsRejectForm,
    main: true,
    red: true,
  },
  {
    name: "Comment",
    icon: MessageOutlined,
  },
]);
