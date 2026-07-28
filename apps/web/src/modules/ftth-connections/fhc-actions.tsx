import {
  CheckOutlined,
  CloseOutlined,
  MessageOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { m } from "i18n/messages";
import { StaffRole, WorkStatus as When } from "schema/enums";
import type { FtthConnectionT as What } from "schema/fhc";
import type { UserFullT } from "schema/people";
import { buildActions } from "#/components/actions/types";
import CommentForm from "../work/CommentForm";
import FhcAcceptForm from "./forms/FhcAcceptForm";
import FhcRejectForm from "./forms/FhcRejectForm";
import FhcSubmitForm from "./forms/FhcSubmitForm";
import FhcSurveyForm from "./forms/FhcSurveyForm";

function isWhen(what: What, when: When) {
  return what.work.status === when;
}

function isWho(what: What, whom: StaffRole | "vendor", user: UserFullT) {
  if (user.isAdmin) return true;

  const work = what.work;
  if (whom === "vendor") {
    const vendorId = work.vendor?.id;
    return !!vendorId && vendorId === user.vendor?.id;
  }
  return user.staffRole === whom;
}

const { HOME_INTERNET } = StaffRole;
const VENDOR = "vendor";

export const fhcActions = buildActions(isWhen, isWho, [
  {
    name: m.finish_survey(),
    icon: SendOutlined,
    when: [When.SURVEY],
    form: FhcSurveyForm,
    whom: [VENDOR],
    main: true,
  },
  {
    name: m.action_finish(),
    icon: SendOutlined,
    form: FhcSubmitForm,
    when: [When.INSTALLATION, When.FAILED],
    whom: [VENDOR],
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
