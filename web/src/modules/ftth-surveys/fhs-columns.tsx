import { StaffRole } from "schema/enums";
import type { FtthSurveyT } from "schema/fhs";
import type { DtColumn } from "#/components/data-page/types";
import StatusView from "#/components/StatusView";
import WithCaption from "#/components/WithCaption";
import { shortName } from "#/utils/names";

export type FhsColumn = DtColumn<FtthSurveyT>;

const asigneeRole = StaffRole.PLANNING_ENGINEER;
export function worker(i: FtthSurveyT, role: StaffRole = asigneeRole) {
  return i.work.workers.find((w) => w.role === role)?.user;
}
export const fhsColumns: FhsColumn[] = [
  {
    key: "id",
    title: "ID",
    width: 100,
    onClick: true,
    render: (p) => (
      <WithCaption
        title={<span>{p.work.sid}</span>}
        caption={<span className="text-blue-400">Voir les détails</span>}
      />
    ),
  },
  {
    key: "name",
    title: "Nom",
    width: 200,
    onClick: true,
    render: (p) => (
      <WithCaption
        title={p.work.name}
        caption={[p.work.locality?.district?.name, p.work.locality?.name]}
      />
    ),
  },
  {
    title: "Statut / En attente de",
    key: "status",
    width: 150,
    render: (t) => (
      <StatusView
        work={t.work}
        pendingOn={{
          REQUESTED: "PLANNING_MANAGER",
          ASSIGNED: "PLANNING_ENGINEER",
          ONGOING: "VENDOR",
          REVIEW: "PLANNING_ENGINEER",
          REVIEW_FAILED: "VENDOR",
        }}
      />
    ),
  },
  {
    title: "Assigné à",
    key: "assigned",
    width: 150,
    render: (t) => (
      <WithCaption
        title={shortName(worker(t)?.name)}
        caption={t.work.vendor?.name || "-"}
      />
    ),
  },
];
