import { Modal, Tabs } from "antd";
import { m } from "i18n/messages";
import { WorkStatus } from "schema/enums";
import type { FtthConnectionT } from "schema/fhc";
import { filterTruthy } from "schema/utils";
import type { ModalItemProps } from "#/hooks/useModalViewer";
import WorkLogsTab from "../../../components/WorkLogsTab";
import FhcDetailsTab from "./FhcDetailsTab";
import type { FhcTabProps } from "./types";

const hasImages: WorkStatus[] = [
  WorkStatus.ONGOING,
  WorkStatus.REVIEW,
  WorkStatus.REVIEW_FAILED,
  WorkStatus.CLOSED,
];

export default function fhcDetailsModal(
  props: ModalItemProps<FtthConnectionT>,
) {
  const tabProps: FhcTabProps = { item: props.item };
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
            children: <FhcDetailsTab {...tabProps} />,
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
