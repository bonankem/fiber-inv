import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Modal } from "antd";
import { useAuthToken } from "#/api/auth";
import { useApiPost } from "#/api/helpers";
import type { ModalStateProps } from "#/hooks/useModalViewer";

export default function LogoutModal(props: ModalStateProps) {
  const logout = useApiPost<void>("/auth/logout");
  const client = useQueryClient();
  const token = useAuthToken();
  const navigate = useNavigate();
  const pending = logout.isPending;

  const doLogout = async () => {
    if (pending) return;
    await logout.mutateAsync().catch(() => {});
    token.update(null);
    await client.invalidateQueries();
    navigate({ to: "/login", replace: true });
  };

  return (
    <Modal
      title="Log out of ServiceX"
      open={props.state.isOpen}
      okText="Log out"
      cancelText="Back"
      closable={false}
      onOk={doLogout}
      mask={{ blur: true, closable: !pending }}
      cancelButtonProps={{ className: pending ? "hidden" : "" }}
      okButtonProps={{ loading: pending }}
      onCancel={props.state.close}
      width={320}
    />
  );
}
