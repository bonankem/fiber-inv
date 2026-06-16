import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Modal } from "antd";
import { m } from "i18n/messages";
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
    navigate({ to: "/login", replace: true });
    token.update(null);
    client.clear();
  };

  return (
    <Modal
      title={m.logout_title()}
      open={props.state.isOpen}
      okText={m.log_out()}
      cancelText={m.back()}
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
