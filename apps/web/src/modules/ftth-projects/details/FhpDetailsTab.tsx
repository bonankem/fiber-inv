import { m } from "i18n/messages";
import { StaffRole } from "schema/enums";
import { workerOf } from "schema/work";
import CoordsLink from "#/components/CoordsLink";
import DetailsCard from "#/components/DetailsCard";
import StatusView from "#/components/StatusView";
import JobEmrfCard from "#/modules/inventory/JobEmrfCard";
import type { FhpTabProps } from "./types";

export default function FhpDetailsTab(props: FhpTabProps) {
  const w = props.item.work;
  const isAbidjan = w.locality?.district?.name === "Abidjan";
  const localName = isAbidjan ? "Commune" : m.department();
  const ENGINEER = StaffRole.PROJECT_ENGINEER;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DetailsCard
        missing="dash"
        items={[
          { label: m.name(), value: w.name },
          { label: m.id(), value: w.sid },
          { label: m.status(), value: <StatusView work={w} smaller /> },
          { label: m.assignee(), value: workerOf(w, ENGINEER)?.name },
          { label: m.field_vendor(), value: w.vendor?.name },
          { label: localName, value: w.locality?.name },
          { label: "District", value: w.locality?.district?.name },
          { label: m.coords(), value: <CoordsLink coords={w.coords} /> },
        ]}
      />
      <JobEmrfCard projectId={props.item.id} />
    </div>
  );
}
