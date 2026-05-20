import type { StaffRole, WorkStatus } from "schema/enums";
import type { Maybe } from "schema/utils";
import type { WorkT } from "schema/work";
import { shortName } from "#/utils/names";
import WithCaption from "./WithCaption";

type PendingMap = {
  [Key in WorkStatus]?: StaffRole | "VENDOR";
};

type Props = {
  work: WorkT;
  pendingOn: PendingMap;
};

export default function StatusView(props: Props) {
  const work = props.work;
  const status = work.status;
  const pendingKey = props.pendingOn[status];
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
