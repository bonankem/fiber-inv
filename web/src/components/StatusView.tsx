import type { StaffRole, WorkStatus } from "schema/enums";
import type { Maybe } from "schema/utils";
import type { WorkT } from "schema/work";
import WithCaption from "./WithCaption";

type PendingMap = {
  [Key in WorkStatus]?: StaffRole | "VENDOR";
};

type Props = {
  work: WorkT;
  pending: PendingMap;
};

export default function StatusView(props: Props) {
  const work = props.work;
  const status = work.status;
  const pendingKey = props.pending[status];
  const pendingOn =
    pendingKey === "VENDOR"
      ? work.vendor?.name
      : shortName(worker(work, pendingKey));

  return <WithCaption title={statusNames[status]} caption={pendingOn} />;
}

function worker(work: WorkT, role: Maybe<StaffRole>) {
  return work.workers.find((w) => w.role === role)?.user;
}

const statusNames: Record<WorkStatus, string> = {
  REQUESTED: "Demandée",
  ASSIGNED: "Assigné",
  ONGOING: "En cours",
  REVIEW: "À vérifier",
  REVIEW_FAILED: "Échoué",
  CANCELLED: "Annulé",
  CLOSED: "Terminé",
};

function shortName(who: Maybe<string | { name: string }>) {
  const name = typeof who === "string" ? who : who?.name;
  if (!name) return undefined;
  if (name.length < 20) return name;
  return name.replace(/^(\S+).*?(\p{L})\S*$/u, "$1 $2.");
}
