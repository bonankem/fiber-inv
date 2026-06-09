import { m } from "i18n/messages";
import { StaffRole } from "schema/enums";
import { workerOf } from "schema/work";
import CoordsLink from "#/components/CoordsLink";
import DetailsCard from "#/components/DetailsCard";
import DownloadList from "#/components/DownloadList";
import StatusView from "#/components/StatusView";
import type { FhsTabProps } from "./types";

export default function FhsDetailsTab(props: FhsTabProps) {
  const w = props.item.work;
  const isAbidjan = w.locality?.district?.name === "Abidjan";
  const localName = isAbidjan ? "Commune" : m.department();
  const ENGINEER = StaffRole.PLANNING_ENGINEER;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DetailsCard
        missing="dash"
        items={[
          { label: m.name(), value: w.name },
          { label: m.id(), value: w.sid },
          { label: m.status(), value: <StatusView work={w} smaller /> },
          { label: m.field_assignee(), value: workerOf(w, ENGINEER)?.name },
          { label: m.field_vendor(), value: w.vendor?.name },
          { label: localName, value: w.locality?.name },
          { label: "District", value: w.locality?.district?.name },
          { label: m.field_coords(), value: <CoordsLink coords={w.coords} /> },
          { label: "Contact", value: props.item.contact },
        ]}
      />
      <DetailsCard
        items={[
          {
            label: "Documents",
            value: (
              <DownloadList files={props.full?.work?.docs} className="mt-2" />
            ),
            vertical: true,
          },
        ]}
      />
    </div>
  );
}
