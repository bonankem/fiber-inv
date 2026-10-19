import { FileOutlined } from "@ant-design/icons";
import { m } from "i18n/messages";
import { StaffRole, WorkDocType } from "schema/enums";
import { workerOf } from "schema/work";
import { twJoin } from "tailwind-merge";
import { downloadUrl } from "#/api/helpers";
import CoordsLink from "#/components/CoordsLink";
import DetailsCard from "#/components/DetailsCard";
import StatusView from "#/components/StatusView";
import type { FhsTabProps } from "./types";

export default function FhsDetailsTab(props: FhsTabProps) {
  const s = props.item;
  const f = props.full;
  const w = s.work;
  const isAbidjan = w.locality?.district?.name === "Abidjan";
  const localName = isAbidjan ? "Commune" : m.department();
  const ENGINEER = StaffRole.PLANNING_ENGINEER;
  const docs = f?.work?.docs;

  function doc(type: WorkDocType, label: string) {
    const up = docs?.find((d) => d.type === type)?.upload;
    if (!up) return null;
    return {
      label,
      value: (
        // some browser extension might add icons next to the link,
        // so set the outer container to row-reverse so the icons appear on the inside.
        <div className="flex flex-row-reverse gap-2">
          <a
            href={downloadUrl(up)}
            target="_blank"
            rel="noopener noreferrer"
            className={twJoin(
              "w-fit max-w-full inline-flex text-blue-500!",
              "dark:border-blue-400! dark:text-blue-400!",
              "hover:border-yellow-600! hover:text-yellow-600!",
              "dark:hover:border-yellow-500! dark:hover:text-yellow-500!",
              "transition-colors! duration-100!",
            )}
          >
            <span>{m.view_document()}</span>
            <FileOutlined className="text-xs ml-2" />
          </a>
        </div>
      ),
    };
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DetailsCard
        missing="hide"
        items={[
          { label: m.name(), value: w.name },
          { label: m.id(), value: w.sid },
          { label: m.status(), value: <StatusView work={w} smaller /> },
          { label: m.assignee(), value: workerOf(w, ENGINEER)?.name },
          { label: m.field_vendor(), value: w.vendor?.name },
          { label: m.area(), value: s.area },
          { label: localName, value: w.locality?.name },
          { label: "District", value: w.locality?.district?.name },
          { label: m.coords(), value: <CoordsLink coords={w.coords} /> },
          { label: m.clusters(), value: f?.clusters },
          { label: m.expected_hp(), value: f?.expectedHp },
          { label: m.reported_hp(), value: f?.reportedHp },
        ]}
      />
      <DetailsCard
        items={[
          doc(WorkDocType.AREA_KMZ, m.area_kmz()),
          doc(WorkDocType.FHS_TALLY_KMZ, m.fhs_tally_kmz()),
          doc(WorkDocType.FHS_TALLY_TABLE, m.fhs_tally_excel()),
          doc(WorkDocType.FHS_PARTING_KMZ, m.parting_kmz()),
          doc(WorkDocType.FHS_SIZING_KMZ, m.sizing_kmz()),
          doc(WorkDocType.FHS_COORDINATES, m.coords()),
          doc(WorkDocType.FHS_CABLE_LENGTHS, m.cable_lengths()),
          doc(WorkDocType.FHS_SYNOPTIC_TABLE, m.field_synoptic_table()),
          doc(WorkDocType.FHS_SYNOPTIC_DIAGRAM, m.field_synoptic_diag()),
          doc(WorkDocType.FHS_PLAN_DIAGRAM, m.plan_diag()),
        ]}
      />
    </div>
  );
}
