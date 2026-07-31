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
  ASSIGNED: "cyan",
  BUILDING_CABLING: "orange",
  CANCELLED: "red",
  CLOSED: "green",
  CONFIGURATION: "cyan",
  DECLINED: "red",
  DESATURATION: "orange",
  FAILED_FIELD_ATP: "volcano",
  FAILED_REVIEW: "volcano",
  INSTALLATION: "blue",
  REQUESTED: "cyan",
  REVIEW: "cyan",
  SURVEY: "blue",
};

const statusNames: Record<WorkStatus, string> = {
  ASSIGNED: m.assigned(),
  BUILDING_CABLING: m.building_cabling(),
  CANCELLED: m.cancelled(),
  CLOSED: m.closed(),
  CONFIGURATION: m.configuration(),
  DECLINED: m.declined(),
  DESATURATION: m.desaturation(),
  FIELD_ATP: m.field_atp(),
  FAILED_FIELD_ATP: m.failed_field_atp(),
  FAILED_REVIEW: m.failed_review(),
  INSTALLATION: m.installation(),
  REQUESTED: m.requested(),
  REVIEW: m.review(),
  SURVEY: m.survey(),
};
