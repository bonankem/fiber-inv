import { Tag, type TagProps } from "antd";
import { m } from "i18n/messages";
import type { WorkStatus } from "schema/enums";
import { twJoin } from "tailwind-merge";

type Props = {
  status: WorkStatus;
  smaller?: boolean;
};

export default function StatusBadge(props: Props) {
  const status = props.status;

  return (
    <Tag
      variant="outlined"
      color={colors[status] || "blue"}
      className={twJoin(props.smaller && "leading-tight!")}
    >
      {statusNames[status]}
    </Tag>
  );
}

const colors: Partial<Record<WorkStatus, TagProps["color"]>> = {
  REQUESTED: "cyan",
  ASSIGNED: "cyan",
  REVIEW: "cyan",
  SURVEY: "blue",
  INSTALLATION: "blue",
  CLOSED: "green",
  FAILED: "volcano",
  DECLINED: "red",
  CANCELLED: "red",
  DESATURATION: "orange",
  BUILDING_CABLING: "orange",
};

const statusNames: Record<WorkStatus, string> = {
  REQUESTED: m.requested(),
  DECLINED: m.declined(),
  ASSIGNED: m.assigned(),
  SURVEY: m.survey(),
  INSTALLATION: m.installation(),
  BUILDING_CABLING: m.building_cabling(),
  DESATURATION: m.desaturation(),
  REVIEW: m.review(),
  FAILED: m.failed(),
  CANCELLED: m.cancelled(),
  CLOSED: m.closed(),
};
