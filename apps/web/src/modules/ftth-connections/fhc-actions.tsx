import { MessageOutlined } from "@ant-design/icons";
import { m } from "i18n/messages";
import type { WorkStatus as When } from "schema/enums";
import type { FtthConnectionT as What } from "schema/fhc";
import { buildActions } from "#/components/actions/types";
import CommentForm from "../work/CommentForm";

function isWhen(what: What, when: When) {
  return what.work.status === when;
}

function isWho() {
  return true;
}

export const fhcActions = buildActions(isWhen, isWho, [
  {
    name: m.action_comment(),
    icon: MessageOutlined,
    form: CommentForm,
  },
]);
