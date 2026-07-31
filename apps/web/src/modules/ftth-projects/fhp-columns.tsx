import { m } from "i18n/messages";
import { StaffRole } from "schema/enums";
import type { FtthProjectT } from "schema/fhp";
import type { DtColumn } from "#/components/data-page/types";
import StatusView from "#/components/StatusView";
import WithCaption from "#/components/WithCaption";
import { shortName } from "#/utils/names";

export type FhpColumn = DtColumn<FtthProjectT>;

const assigneeRole = StaffRole.PROJECT_ENGINEER;
export function worker(i: FtthProjectT, role: StaffRole = assigneeRole) {
  return i.work.workers.find((w) => w.role === role)?.user;
}

export const fhpColumns: FhpColumn[] = [
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
    key: "status",
    title: m.status_pending_on(),
    width: 150,
    render: (t) => (
      <StatusView
        work={t.work}
        pendingOn={{
          REQUESTED: "PROJECT_MANAGER",
          ASSIGNED: "PROJECT_ENGINEER",
          INSTALLATION: "VENDOR",
          REVIEW: "PROJECT_ENGINEER",
          FAILED_REVIEW: "VENDOR",
        }}
      />
    ),
  },
  {
    key: "assigned",
    title: m.assigned_to(),
    width: 150,
    render: (t) => (
      <WithCaption
        title={shortName(worker(t)?.name)}
        caption={t.work.vendor?.name || "-"}
      />
    ),
  },
];
