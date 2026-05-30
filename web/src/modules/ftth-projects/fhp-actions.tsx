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
    name: "Assign",
    icon: UserOutlined,
    when: [When.REQUESTED],
    form: FhpAssignForm,
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
    form: FhpInitiateForm,
    main: true,
  },
  {
    name: "Submit",
    icon: SendOutlined,
    when: [When.ONGOING],
    form: FhpSubmitForm,
    main: true,
  },
  {
    name: "Accepter",
    icon: ThumbsUp,
    when: [When.REVIEW],
    form: FhpAcceptForm,
    main: true,
  },
  {
    name: "Rejeter",
    icon: CloseOutlined,
    when: [When.REVIEW],
    form: FhpRejectForm,
    main: true,
    red: true,
  },
  {
    name: "Comment",
    icon: MessageOutlined,
    form: CommentForm,
  },
]);
