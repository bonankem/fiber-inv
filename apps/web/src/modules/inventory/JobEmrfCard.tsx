import { Typography } from "antd";
import { useState } from "react";
import DetailsCard from "#/components/DetailsCard";
import StatusBadge from "#/components/StatusBadge";
import { useEmrfList } from "#/modules/hooks/inventory";
import EmrfDrawer from "./EmrfDrawer";
import { emrfActions } from "./emrf-actions";
import { type EmrfRow, emrfShortId } from "./emrf-utils";

/**
 * The EMRFs raised for an HP Delivery project's planning job (EMRFs belong to
 * the HP Planning job); each opens its details drawer.
 */
export default function JobEmrfCard({ surveyId }: { surveyId: string | null }) {
  // without a planning job the list would be unfiltered, so show nothing
  if (!surveyId) return null;
  return <SurveyEmrfCard surveyId={surveyId} />;
}

function SurveyEmrfCard({ surveyId }: { surveyId: string }) {
  const emrfs = useEmrfList({ surveyId, page: 1, pageSize: 100 });
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
