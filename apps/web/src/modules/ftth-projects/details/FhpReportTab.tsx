import { Card, Spin } from "antd";
import { m } from "i18n/messages";
import DetailsCard from "#/components/DetailsCard";
import type { FhpTabProps } from "./types";

export default function FhsReportTab(props: FhpTabProps) {
  const rep = props.item?.report;
  if (!rep) {
    return (
      <Spin className="w-full min-h-40 flex items-center justify-center" />
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DetailsCard
        missing="dash"
        title="Nouvelles quantités"
        items={[
          { label: m.field_x_boxes(), value: rep.xBoxes },
          { label: m.field_hub_boxes(), value: rep.hubBoxes },
          { label: m.field_sub_boxes(), value: rep.subBoxes },
          { label: m.field_end_boxes(), value: rep.endBoxes },
          { label: m.field_closures(), value: rep.closures },
          { label: m.field_manholes(), value: rep.manholes },
          { label: m.field_concrete_poles(), value: rep.metalPoles },
          { label: m.field_metal_poles(), value: rep.concretePoles },
          { label: m.field_tran_cables(), value: `${rep.transportMetres} m` },
          { label: m.field_dist_cables(), value: `${rep.distMetres} m` },
        ]}
      />
      <section className="flex flex-col gap-2">
        <Card className="grow" />
      </section>
    </div>
  );
}
