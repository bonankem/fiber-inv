import { Modal } from "antd";
import { m } from "i18n/messages";
import { useApiGetText } from "#/api/helpers";
import type { ModalStateProps } from "#/hooks/useModalViewer";

export default function UserInfoModal(props: ModalStateProps) {
  const data = useApiGetText("/admin/user-info");

  const save = () => {
    const text = data.data;
    if (!text) return props.state.close();

    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, text], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users-report.csv";
    link.click();
    props.state.close();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <Modal
      title={m.users_report()}
      open={props.state.isOpen}
      onCancel={props.state.close}
      loading={data.isLoading}
      okText={m.download()}
      cancelText={m.back()}
      onOk={save}
    />
  );
}
