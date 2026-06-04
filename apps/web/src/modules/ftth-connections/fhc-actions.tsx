import { MessageOutlined, SendOutlined } from "@ant-design/icons";
import { m } from "i18n/messages";
import { WorkStatus as When } from "schema/enums";
import type { FtthConnectionT as What } from "schema/fhc";
import { buildActions } from "#/components/actions/types";
import CommentForm from "../work/CommentForm";
import FhcUpdateForm from "./update/FhcUpdateForm";

function isWhen(what: What, when: When) {
  return what.work.status === when;
}

function isWho() {
  return true;
}

export const fhcActions = buildActions(isWhen, isWho, [
  {
    name: "Update",
    icon: SendOutlined,
    form: FhcUpdateForm,
    when: [When.REQUESTED, When.ONGOING],
    main: true,
  },
  {
    name: m.action_comment(),
    icon: MessageOutlined,
    form: CommentForm,
  },
]);
