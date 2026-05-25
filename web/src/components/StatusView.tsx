import { Tag, type TagProps } from "antd";
import type { StaffRole, WorkStatus } from "schema/enums";
import type { Maybe } from "schema/utils";
import type { WorkT } from "schema/work";
import { shortName } from "#/utils/names";

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
  const pendingOn = shortName(
    pendingKey === "VENDOR" ? work.vendor?.name : worker(work, pendingKey),
    15,
  );

  return (
    <div className="flex gap-2 items-start">
      <Tag variant="outlined" color={colors[status] || "blue"}>
        {statusNames[status]}
      </Tag>
      {pendingOn && <Tag variant="outlined">{pendingOn}</Tag>}
    </div>
  );
}

function worker(work: WorkT, role: Maybe<StaffRole>) {
  return work.workers.find((w) => w.role === role)?.user;
}

const colors: Partial<Record<WorkStatus, TagProps["color"]>> = {
  CLOSED: "green",
  REVIEW: "purple",
  REVIEW_FAILED: "volcano",
  DECLINED: "red",
  CANCELLED: "red",
  REQUESTED: "purple",
};

const statusNames: Record<WorkStatus, string> = {
  REQUESTED: "Demandée",
  DECLINED: "Refusée",
  ASSIGNED: "Assigné",
  ONGOING: "En cours",
  REVIEW: "Révision",
  REVIEW_FAILED: "Révision rejetée",
  CANCELLED: "Annulé",
  CLOSED: "Terminé",
};
