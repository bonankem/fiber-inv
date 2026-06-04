import { m } from "i18n/messages";
import CoordsLink from "#/components/CoordsLink";
import DetailsCard from "#/components/DetailsCard";
import StatusView from "#/components/StatusView";
import type { FhcTabProps } from "./types";

export default function FhcDetailsTab(props: FhcTabProps) {
  const i = props.item;
  const w = i.work;
  const isAbidjan = w.locality?.district?.name === "Abidjan";
  const localName = isAbidjan ? "Commune" : m.department();

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DetailsCard
        missing="dash"
        items={[
          { label: m.name(), value: w.name },
          { label: "FN", value: i.fn },
          { label: m.id(), value: w.sid },
          { label: m.address(), value: i.address },
          { label: m.phone(), value: i.phone },
          { label: m.email(), value: i.email },
          { label: m.status(), value: <StatusView work={w} smaller /> },
          { label: m.field_vendor(), value: w.vendor?.name },
          { label: localName, value: w.locality?.name },
          { label: "District", value: w.locality?.district?.name },
          { label: m.field_coords(), value: <CoordsLink coords={w.coords} /> },
        ]}
      />
    </div>
  );
}
