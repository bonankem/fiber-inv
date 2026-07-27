import { Modal, Tabs } from "antd";
import { m } from "i18n/messages";
import { useMemo } from "react";
import { filterTruthy } from "schema/utils";
import { workDocZ } from "schema/work";
import { useApiGet } from "#/api/helpers";
import WorkLogsTab from "../../../components/WorkLogsTab";
import type { FhpFormProps } from "../fhp-types";
import FhpDetailsTab from "./FhpDetailsTab";
import FhpImagesTab from "./FhpImagesTab";
import FhpReportTab from "./FhpReportTab";
import type { FhpTabProps } from "./types";

export default function FhpDetailsModal({ item, state }: FhpFormProps) {
  const docsQ = useApiGet(["work", item.id, "docs"], workDocZ.array());
  const images = useMemo(() => {
    return docsQ.data?.filter((i) => i.upload.type.startsWith("image/"));
  }, [docsQ.data]);

  const tabProps: FhpTabProps = { item, images };

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
            children: <FhpDetailsTab {...tabProps} />,
          },
          item.report && {
            key: "report",
            label: m.report(),
            children: <FhpReportTab {...tabProps} />,
          },
          !!images?.length && {
            key: "images",
            label: m.images(),
            children: <FhpImagesTab {...tabProps} />,
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
