import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import { StaffRole } from "schema/enums";
import { zArray } from "schema/utils";
import { workDocZ, workerOf } from "schema/work";
import { getJson } from "#/api/helpers";
import CoordsLink from "#/components/CoordsLink";
import DetailsCard from "#/components/DetailsCard";
import StatusView from "#/components/StatusView";
import type { FhsTabProps } from "./types";

export default function FhsDetailsTab(props: FhsTabProps) {
  const w = props.item.work;
  const id = w.id;
  const isAbidjan = w.locality?.district?.name === "Abidjan";
  const localName = isAbidjan ? "Commune" : "Département";
  const ENGINEER = StaffRole.PLANNING_ENGINEER;

  const docsQuery = useQuery({
    queryFn: () => getJson(`work/${id}/docs`, zArray(workDocZ)),
    queryKey: ["work", id, "docs"],
  });

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
      <section className="flex flex-col gap-2">
        <Card className="grow" />
      </section>
    </div>
  );
}
