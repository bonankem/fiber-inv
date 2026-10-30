import { Modal, Tabs } from "antd";
import { m } from "i18n/messages";
import { ftthSurveyFullZ } from "schema/fhs";
import { filterTruthy } from "schema/utils";
import { useApiGet } from "#/api/helpers";
import WorkLogsTab from "../../../components/WorkLogsTab";
import type { FhsFormProps } from "../fhs-types";
import FhsBomTab from "./FhsBomTab";
import FhsDetailsTab from "./FhsDetailsTab";
import FhsQuantityTab from "./FhsQuantityTab";
import type { FhsTabProps } from "./types";

export default function FhsDetailsModal(props: FhsFormProps) {
  const id = props.item.id;
  const fullQuery = useApiGet(["fhs", id], ftthSurveyFullZ);
  const tabProps: FhsTabProps = {
    item: props.item,
    full: fullQuery.data,
    loading: fullQuery.isLoading,
  };

  return (
    <Modal
      width={900}
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
            children: <FhsDetailsTab {...tabProps} />,
          },
          fullQuery.data?.quantity && {
            key: "report",
            label: m.report(),
            children: <FhsQuantityTab {...tabProps} />,
          },
          !!fullQuery.data?.bom.length && {
            key: "bom",
            label: m.bom(),
            children: <FhsBomTab {...tabProps} />,
          },
          {
            key: "logs",
            label: m.logs(),
            children: <WorkLogsTab id={id} />,
          },
        ])}
      />
    </Modal>
  );
}
