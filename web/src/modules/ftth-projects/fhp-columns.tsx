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
    title: "ID",
    width: 100,
    className: "group cursor-pointer",
    render: (p) => (
      <WithCaption
        title={<span className="group-hover:underline">{p.work.sid}</span>}
        caption={
          <span className="text-blue-400 group-hover:underline">
            Voir les détails
          </span>
        }
      />
    ),
  },
  {
    key: "name",
    title: "Nom du lieu",
    width: 200,
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
          REQUESTED: "PROJECT_MANAGER",
          ASSIGNED: "PROJECT_ENGINEER",
          ONGOING: "VENDOR",
          REVIEW: "PROJECT_ENGINEER",
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
