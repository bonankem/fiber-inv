import { Modal, Tabs } from "antd";
import { filterTruthy } from "schema/utils";
import WorkLogsTab from "../../../components/WorkLogsTab";
import type { FhsFormProps } from "../fhs-types";
import FhsDetailsTab from "./FhsDetailsTab";

export default function FhsDetailsModal(props: FhsFormProps) {
  return (
    <Modal
      width={800}
      open={props.state.isOpen}
      onCancel={props.state.close}
      mask={{ blur: true, closable: true }}
      okButtonProps={{ className: "hidden!" }}
      cancelButtonProps={{ className: "hidden!" }}
      cancelText="Close"
    >
      <Tabs
        type="card"
        items={filterTruthy([
          {
            key: "details",
            label: "Détails",
            children: <FhsDetailsTab item={props.item} />,
          },
          {
            key: "logs",
            label: "Journaux",
            children: <WorkLogsTab id={props.item.id} />,
          },
        ])}
      />
    </Modal>
  );
}
