import { m } from "i18n/messages";
import { StaffRole } from "schema/enums";
import type { FtthSurveyT } from "schema/fhs";
import type { DtColumn } from "#/components/data-page/types";
import StatusView from "#/components/StatusView";
import WithCaption from "#/components/WithCaption";
import { shortName } from "#/utils/names";

export type FhsColumn = DtColumn<FtthSurveyT>;

const VENDOR = "VENDOR" as const;
const MANAGER = StaffRole.PLANNING_MANAGER;
const ASSIGNEE = StaffRole.PLANNING_ENGINEER;

export function worker(i: FtthSurveyT, role: StaffRole = ASSIGNEE) {
  return i.work.workers.find((w) => w.role === role)?.user;
}
export const fhsColumns: FhsColumn[] = [
  {
    key: "id",
    title: m.id(),
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
    title: m.name(),
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
    title: m.status_pending_on(),
    key: "status",
    width: 200,
    render: (t) => (
      <StatusView
        work={t.work}
        pendingOn={{
          REQUESTED: MANAGER,
          ASSIGNED: ASSIGNEE,
          SURVEY: VENDOR,

          TALLYING: VENDOR,
          PARTING: VENDOR,
          SIZING: VENDOR,
          BOM: VENDOR,

          TALLYING_VALIDATION: ASSIGNEE,
          PARTING_VALIDATION: ASSIGNEE,
          SIZING_VALIDATION: ASSIGNEE,
          BOM_VALIDATION: ASSIGNEE,

          TALLYING_REJECTED: VENDOR,
          PARTING_REJECTED: VENDOR,
          SIZING_REJECTED: VENDOR,
          BOM_REJECTED: VENDOR,

          REVIEW: ASSIGNEE,
          FAILED_REVIEW: VENDOR,
        }}
      />
    ),
  },
  {
    title: m.assigned_to(),
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
