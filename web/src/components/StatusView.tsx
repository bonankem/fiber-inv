import { Badge } from "antd";
import type { PresetStatusColorType } from "antd/es/_util/colors";
import { type PresetColorKey, PresetColors } from "antd/es/theme/internal";
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

  const color = statusColors[status];
  const badge = PresetColors.includes(color as PresetColorKey) ? (
    <Badge color={color} />
  ) : (
    <Badge status={color as PresetStatusColorType} />
  );

  return (
    <div className="flex gap-2 items-start">
      {badge}
      <WithCaption title={statusNames[status]} caption={pendingOn} />
    </div>
  );
}

function worker(work: WorkT, role: Maybe<StaffRole>) {
  return work.workers.find((w) => w.role === role)?.user;
}

const statusNames: Record<WorkStatus, string> = {
  REQUESTED: "Demandée",
  DECLINED: "Refusée",
  ASSIGNED: "Assigné",
  ONGOING: "En cours",
  REVIEW: "À vérifier",
  REVIEW_FAILED: "Échoué",
  CANCELLED: "Annulé",
  CLOSED: "Terminé",
};

const statusColors: Record<WorkStatus, PresetColorKey | PresetStatusColorType> =
  {
    REQUESTED: "geekblue",
    DECLINED: "red",
    ASSIGNED: "blue",
    ONGOING: "blue",
    REVIEW: "blue",
    REVIEW_FAILED: "red",
    CANCELLED: "red",
    CLOSED: "green",
  };
