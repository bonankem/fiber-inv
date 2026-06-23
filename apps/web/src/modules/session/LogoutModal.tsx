import { Modal } from "antd";
import { m } from "i18n/messages";
import type { ModalStateProps } from "#/hooks/useModalViewer";
import { useLogout } from "./utils";

export default function LogoutModal(props: ModalStateProps) {
  const logout = useLogout();
  const pending = logout.pending;

  return (
    <Modal
      title={m.logout_title()}
      open={props.state.isOpen}
      okText={m.log_out()}
      cancelText={m.back()}
      closable={false}
      onOk={logout.call}
      mask={{ blur: true, closable: !pending }}
      cancelButtonProps={{ className: pending ? "hidden" : "" }}
      okButtonProps={{ loading: pending }}
      onCancel={props.state.close}
      width={320}
    />
  );
}
