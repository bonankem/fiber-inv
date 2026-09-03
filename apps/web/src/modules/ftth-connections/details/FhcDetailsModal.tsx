import { Modal, Tabs } from "antd";
import { m } from "i18n/messages";
import { WorkStatus } from "schema/enums";
import { fhcCostZ } from "schema/fhc";
import { filterTruthy } from "schema/utils";
import { useApiGet } from "#/api/helpers";
import WorkLogsTab from "../../../components/WorkLogsTab";
import type { FhcFormProps } from "../fhc-types";
import FhcDetailsTab from "./FhcDetailsTab";
import FhcImagesTab from "./FhcImagesTab";
import FhcQuantitiesTab from "./FhcQuantitiesTab";

const hasImages: WorkStatus[] = [
  WorkStatus.REVIEW,
  WorkStatus.FAILED_REVIEW,
  WorkStatus.CLOSED,
];

export default function FhcDetailsModal({ item, state }: FhcFormProps) {
  const costQ = useApiGet(["fhc", item.id, "cost"], fhcCostZ);
  const cost = costQ.data;
  const status = item.work.status;
  const hasImg = hasImages.includes(status);

  return (
    <Modal
      width={800}
      open={state.isOpen}
      onCancel={state.close}
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
            children: <FhcDetailsTab item={item} />,
          },
          hasImg && {
            key: "images",
            label: m.images(),
            children: <FhcImagesTab item={item} />,
          },
          !!cost?.quantities?.length && {
            key: "quantities",
            label: m.quantities(),
            children: <FhcQuantitiesTab item={item} cost={cost} />,
          },
          {
            key: "logs",
            label: m.logs(),
            children: <WorkLogsTab id={item.id} />,
          },
        ])}
      />
    </Modal>
  );
}
