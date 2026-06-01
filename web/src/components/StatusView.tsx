import { Tag, type TagProps } from "antd";
import { m } from "i18n/messages";
import type { StaffRole, WorkStatus } from "schema/enums";
import type { Maybe } from "schema/utils";
import type { WorkT } from "schema/work";
import { twJoin } from "tailwind-merge";
import { shortName } from "#/utils/names";

type PendingMap = {
  [Key in WorkStatus]?: StaffRole | "VENDOR";
};

type Props = {
  work: WorkT;
  smaller?: boolean;
  pendingOn?: PendingMap;
};

export default function StatusView(props: Props) {
  const work = props.work;
  const status = work.status;
  const pendingKey = props.pendingOn?.[status];
  const pendingOn =
    pendingKey === "VENDOR" ? work.vendor?.name : worker(work, pendingKey);
  const pendingName = shortName(pendingOn, 15);

  return (
    <div className="flex gap-2 items-start">
      <Tag
        variant="outlined"
        color={colors[status] || "blue"}
        className={twJoin(props.smaller && "leading-tight!")}
      >
        {statusNames[status]}
      </Tag>
      {pendingName && (
        <Tag
          variant="outlined"
          className={twJoin(props.smaller && "leading-tight!")}
        >
          {pendingName}
        </Tag>
      )}
    </div>
  );
}

function worker(work: WorkT, role: Maybe<StaffRole>) {
  return role ? work.workers.find((w) => w.role === role)?.user : undefined;
}

const colors: Partial<Record<WorkStatus, TagProps["color"]>> = {
  CLOSED: "green",
  REVIEW: "gold",
  REVIEW_FAILED: "volcano",
  DECLINED: "red",
  CANCELLED: "red",
  REQUESTED: "gold",
};

const statusNames: Record<WorkStatus, string> = {
  REQUESTED: m.requested(),
  DECLINED: m.declined(),
  ASSIGNED: m.assigned(),
  ONGOING: m.ongoing(),
  REVIEW: m.review(),
  REVIEW_FAILED: m.rejected(),
  CANCELLED: m.cancelled(),
  CLOSED: m.closed(),
};
