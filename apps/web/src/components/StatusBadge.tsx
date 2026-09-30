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

  TALLYING: "blue",
  PARTING: "blue",
  SIZING: "blue",
  BOM: "blue",

  TALLYING_VALIDATION: "cyan",
  PARTING_VALIDATION: "cyan",
  SIZING_VALIDATION: "cyan",
  BOM_VALIDATION: "cyan",

  TALLYING_REJECTED: "volcano",
  PARTING_REJECTED: "volcano",
  SIZING_REJECTED: "volcano",
  BOM_REJECTED: "volcano",
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

  TALLYING: m.tallying(),
  PARTING: m.parting(),
  SIZING: m.sizing(),
  BOM: m.bom(),

  TALLYING_VALIDATION: m.tallying_validation(),
  PARTING_VALIDATION: m.parting_validation(),
  SIZING_VALIDATION: m.sizing_validation(),
  BOM_VALIDATION: m.bom_validation(),

  TALLYING_REJECTED: m.tallying_rejected(),
  PARTING_REJECTED: m.parting_rejected(),
  SIZING_REJECTED: m.sizing_rejected(),
  BOM_REJECTED: m.bom_rejected(),
};
