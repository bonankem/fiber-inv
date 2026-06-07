import { Card, Spin } from "antd";
import DetailsCard from "#/components/DetailsCard";
import type { FhsTabProps } from "./types";

export default function FhsReportTab(props: FhsTabProps) {
  const rep = props.full?.report;
  if (props.loading || !rep) {
    return (
      <Spin className="w-full min-h-40 flex items-center justify-center" />
    );
  }

  return (
    <div className="grid md:grid-cols-[1fr_2fr] gap-4">
      <DetailsCard
        missing="dash"
        title="Nouvelles quantités"
        items={[
          { label: "HP", value: rep.hp },
          { label: "OLT Cards", value: rep.oltCards },
          { label: "X Boxes", value: rep.xBoxes },
          { label: "Hub Boxes", value: rep.hubBoxes },
          { label: "Sub Boxes", value: rep.subBoxes },
          { label: "End Boxes", value: rep.endBoxes },
          { label: "Closures", value: rep.closures },
          { label: "Chambres", value: rep.manholes },
          { label: "Poteaux bétons", value: rep.metalPoles },
          { label: "Poteaux metalliques", value: rep.concretePoles },
          { label: "Câbles transport", value: `${rep.transportMetres} m` },
          { label: "Câbles distribution", value: `${rep.distMetres} m` },
        ]}
      />
      <section className="flex flex-col gap-2">
        <Card className="grow" />
      </section>
    </div>
  );
}
