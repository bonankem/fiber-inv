import { Typography } from "antd";
import { useState } from "react";
import DetailsCard from "#/components/DetailsCard";
import StatusBadge from "#/components/StatusBadge";
import { useEmrfList } from "#/modules/hooks/inventory";
import EmrfDrawer from "./EmrfDrawer";
import { emrfActions } from "./emrf-actions";
import { type EmrfRow, emrfShortId } from "./emrf-utils";

/** The EMRFs raised for an HP Delivery project; each opens its details drawer. */
export default function JobEmrfCard({ projectId }: { projectId: string }) {
  const emrfs = useEmrfList({ projectId, page: 1, pageSize: 100 });
  const [viewing, setViewing] = useState<EmrfRow>();
  const items = emrfs.data?.items ?? [];
  if (!items.length) return null;

  return (
    <>
      <DetailsCard
        title="EMRF"
        items={items.map((emrf) => ({
          key: emrf.id,
          label: (
            <Typography.Link
              className="font-mono text-sm! font-medium"
              onClick={() => setViewing(emrf)}
            >
              {emrfShortId(emrf)}
            </Typography.Link>
          ),
          value: <StatusBadge status={emrf.status} smaller />,
        }))}
      />
      <EmrfDrawer
        actions={emrfActions}
        emrf={viewing}
        onClose={() => setViewing(undefined)}
      />
    </>
  );
}
