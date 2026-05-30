import { StaffRole } from "schema/enums";
import { workerOf } from "schema/work";
import CoordsLink from "#/components/CoordsLink";
import DetailsCard from "#/components/DetailsCard";
import StatusView from "#/components/StatusView";
import type { FhpTabProps } from "./types";

export default function FhpDetailsTab(props: FhpTabProps) {
  const w = props.item.work;
  const isAbidjan = w.locality?.district?.name === "Abidjan";
  const localName = isAbidjan ? "Commune" : "Département";
  const ENGINEER = StaffRole.PROJECT_ENGINEER;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DetailsCard
        missing="dash"
        items={[
          { label: "Nom", value: w.name },
          { label: "ID", value: w.sid },
          { label: "Statut", value: <StatusView work={w} smaller /> },
          { label: "Chargé", value: workerOf(w, ENGINEER)?.name },
          { label: "Fournisseur", value: w.vendor?.name },
          { label: localName, value: w.locality?.name },
          { label: "District", value: w.locality?.district?.name },
          { label: "Coordonnées", value: <CoordsLink coords={w.coords} /> },
          { label: "Contact", value: w.contact },
        ]}
      />
    </div>
  );
}
