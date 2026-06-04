import { Modal, Tabs } from "antd";
import { m } from "i18n/messages";
import { WorkStatus } from "schema/enums";
import { filterTruthy } from "schema/utils";
import WorkLogsTab from "../../../components/WorkLogsTab";
import type { FhpFormProps } from "../fhp-types";
import FhpDetailsTab from "./FhpDetailsTab";
import FhpImagesTab from "./FhpImagesTab";
import type { FhpTabProps } from "./types";

const hasImages: WorkStatus[] = [
  WorkStatus.ONGOING,
  WorkStatus.REVIEW,
  WorkStatus.REVIEW_FAILED,
  WorkStatus.CLOSED,
];

export default function FhpDetailsModal(props: FhpFormProps) {
  const tabProps: FhpTabProps = { item: props.item };
  const status = props.item.work.status;

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
            label: m.details(),
            children: <FhpDetailsTab {...tabProps} />,
          },
          hasImages.includes(status) && {
            key: "Images",
            label: "Images",
            children: <FhpImagesTab {...tabProps} />,
          },
          {
            key: "logs",
            label: m.logs(),
            children: <WorkLogsTab id={props.item.id} />,
          },
        ])}
      />
    </Modal>
  );
}
