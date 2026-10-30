import { RollbackOutlined } from "@ant-design/icons";
import { ShoppingCart, ThumbsUp } from "lucide-react";
import { StaffRole, EmrfStatus as When } from "schema/enums";
import type { UserFullT } from "schema/people";
import { buildActions } from "#/components/actions/types";
import type { ModalItemProps } from "#/hooks/useModalViewer";
import EmrfDrawer from "./EmrfDrawer";
import type { EmrfRow as What } from "./emrf-utils";
import EmrfApproveForm from "./forms/EmrfApproveForm";
import EmrfAssignToForm from "./forms/EmrfAssignToForm";
import EmrfRevertForm from "./forms/EmrfRevertForm";

enum Whom {
  APPROVER = "approver",
  ORACLE = "oracle",
  STAFF = "staff",
  ANY = "any",
}

// Keep aligned with the roles accepted by the backend approval API.
const approvers: StaffRole[] = [
  StaffRole.PLANNING_MANAGER,
  StaffRole.PROJECT_MANAGER,
];

function isWhen(what: What, when: When) {
  return what.status === when;
}

// Admins pass every check before this function is called.
function isWhom(_what: What, whom: Whom, user: UserFullT) {
  if (whom === Whom.ANY) return true;

  if (whom === Whom.APPROVER) {
    return !!user.staffRole && approvers.includes(user.staffRole);
  }

  if (whom === Whom.ORACLE) {
    return user.staffRole === StaffRole.ORACLE_TEAM;
  }

  return !!user.staffRole;
}

/** The details drawer as a modal-viewer form, with these actions in its footer. */
export function EmrfDetailsDrawer({ state, item }: ModalItemProps<What>) {
  return (
    <EmrfDrawer
      actions={emrfActions}
      emrf={state.isOpen ? item : undefined}
      onClose={state.close}
    />
  );
}

export const emrfActions = buildActions(isWhen, isWhom, [
  {
    name: "Approve",
    icon: ThumbsUp,
    when: [When.REQUESTED],
    whom: [Whom.APPROVER],
    form: EmrfApproveForm,
    main: true,
  },
  {
    name: "Assign TO number",
    icon: ShoppingCart,
    when: [When.APPROVED],
    whom: [Whom.ORACLE],
    form: EmrfAssignToForm,
    main: true,
  },
  {
    name: "Revert",
    icon: RollbackOutlined,
    // An approved EMRF can no longer be reverted.
    when: [When.REQUESTED],
    whom: [Whom.STAFF],
    form: EmrfRevertForm,
    main: true,
    red: true,
  },
]);
