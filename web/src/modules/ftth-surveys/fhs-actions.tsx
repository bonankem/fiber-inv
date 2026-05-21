import {
  CalendarOutlined,
  MessageOutlined,
  SendOutlined,
  StopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { WorkStatus as When } from "schema/enums";
import type { FtthSurveyT as What } from "schema/fhs";
import { buildActions } from "#/components/actions/types";
import FhsAssignForm from "./FhsAssignForm";
import FhsInitiateForm from "./FhsInitiateForm";

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
    name: "Reject",
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
    main: true,
  },
  {
    name: "Pass",
    when: [When.REVIEW],
    main: true,
  },
  {
    name: "Fail",
    when: [When.REVIEW],
    main: true,
    red: true,
  },
  {
    name: "Comment",
    icon: MessageOutlined,
  },
]);
