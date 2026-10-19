import { Card, Spin } from "antd";
import { m } from "i18n/messages";
import DetailsCard from "#/components/DetailsCard";
import type { FhsTabProps } from "./types";

export default function FhsQuantityTab(props: FhsTabProps) {
  const qty = props.full?.quantity;
  if (props.loading || !qty) {
    return (
      <Spin className="w-full min-h-40 flex items-center justify-center" />
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DetailsCard
        missing="dash"
        title={m.quantities()}
        items={[
          { label: m.field_x_boxes(), value: qty.xBoxes },
          { label: m.hub_boxes(), value: qty.hubBoxes },
          { label: m.fat_pbo(), value: qty.fats },
          { label: m.closures(), value: qty.closures },
          { label: m.manholes(), value: qty.manholes },
          { label: m.metal_poles(), value: qty.metalPoles },
          { label: m.concrete_poles(), value: qty.concretePoles },
          { label: m.field_tran_cables(), value: `${qty.transportLength} m` },
          { label: m.dist_cables(), value: `${qty.distLength} m` },
        ]}
      />
      <section className="flex flex-col gap-2">
        <Card className="grow" />
      </section>
    </div>
  );
}
