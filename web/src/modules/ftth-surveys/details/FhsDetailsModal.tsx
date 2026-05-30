import { useQuery } from "@tanstack/react-query";
import { Modal, Tabs } from "antd";
import { ftthSurveyFullZ } from "schema/fhs";
import { filterTruthy } from "schema/utils";
import { getJson } from "#/api/helpers";
import WorkLogsTab from "../../../components/WorkLogsTab";
import type { FhsFormProps } from "../fhs-types";
import FhsDetailsTab from "./FhsDetailsTab";
import FhsReportTab from "./FhsReportTab";
import type { FhsTabProps } from "./types";

export default function FhsDetailsModal(props: FhsFormProps) {
  const id = props.item.id;
  const fullQuery = useQuery({
    queryFn: () => getJson(`fhs/${id}`, ftthSurveyFullZ),
    queryKey: ["fhs", id],
  });
  const tabProps: FhsTabProps = {
    item: props.item,
    full: fullQuery.data,
    loading: fullQuery.isLoading,
  };

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
            children: <FhsDetailsTab {...tabProps} />,
          },
          fullQuery.data?.report && {
            key: "report",
            label: "Rapport",
            children: <FhsReportTab {...tabProps} />,
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
