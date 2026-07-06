import { Modal } from "antd";
import { m } from "i18n/messages";
import { useApiGetText } from "#/api/helpers";
import type { ModalStateProps } from "#/hooks/useModalViewer";

export default function AuthLogsModal(props: ModalStateProps) {
  const data = useApiGetText("/admin/auth-logs");

  const save = () => {
    const text = data.data;
    if (!text) return props.state.close();

    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, text], {
      type: "text/csv;charset=utf-8;",
    });

    console.log(text);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "security-logs.csv";
    link.click();
    props.state.close();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <Modal
      width={320}
      title={m.security_logs()}
      open={props.state.isOpen}
      onCancel={props.state.close}
      loading={data.isLoading}
      okText={m.download()}
      cancelText={m.back()}
      onOk={save}
    />
  );
}
