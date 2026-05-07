import { Modal } from "antd";
import type { ModalStateProps } from "#/hooks/useModalViewer";

export default function FhsRequestForm(props: ModalStateProps) {
  return (
    <Modal
      title="Request"
      open={props.state.isOpen}
      onCancel={props.state.close}
      okButtonProps={{ size: "small", className: "min-w-32" }}
      cancelButtonProps={{ size: "small" }}
    ></Modal>
  );
}
