import { Tag } from "antd";
import type { StaffRole, WorkStatus } from "schema/enums";
import type { Maybe } from "schema/utils";
import type { WorkT } from "schema/work";
import { twJoin } from "tailwind-merge";
import { shortName } from "#/utils/names";
import StatusBadge from "./StatusBadge";

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
    pendingKey === "VENDOR"
      ? work.vendor?.name
      : worker(work, pendingKey) ||
        pendingKey
          ?.replace(/_/, " ")
          ?.replace(/\B[A-Z]+/g, (w) => w.toLowerCase());
  const pendingName = shortName(pendingOn, 15);

  return (
    <div className="flex gap-2 items-start">
      <StatusBadge status={status} smaller={props.smaller} />
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
