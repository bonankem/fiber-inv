import { Modal } from "antd";
import { useApiGetText } from "#/api/helpers";
import type { ModalStateProps } from "#/hooks/useModalViewer";

export default function UsersReportForm(props: ModalStateProps) {
  const data = useApiGetText("/admin/user-info");

  const save = () => {
    const text = data.data;
    if (!text) return props.state.close();

    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
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
      title="Download Users Report"
      open={props.state.isOpen}
      onCancel={props.state.close}
      loading={data.isLoading}
      okText="Download"
      onOk={save}
    />
  );
}
