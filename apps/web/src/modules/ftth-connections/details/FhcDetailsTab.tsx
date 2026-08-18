import { m } from "i18n/messages";
import CoordsLink from "#/components/CoordsLink";
import DetailsCard from "#/components/DetailsCard";
import StatusView from "#/components/StatusView";
import { metres, yesNo } from "#/utils/details";
import type { FhcTabProps } from "./types";

export default function FhcDetailsTab(props: FhcTabProps) {
  const i = props.item;
  const w = i.work;
  const isAbidjan = w.locality?.district?.name === "Abidjan";
  const localName = isAbidjan ? m.commune() : m.department();

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DetailsCard
        missing="dash"
        items={[
          { label: m.name(), value: w.name },
          { label: "TN", value: i.tn && `${i.tn}@mtn.ci` },
          { label: m.id(), value: w.sid },
          { label: m.address(), value: i.address },
          { label: m.phone(), value: i.phone },
          { label: m.email(), value: i.email },
          { label: m.field_vendor(), value: w.vendor?.name },
          { label: m.status(), value: <StatusView work={w} smaller /> },
        ]}
      />
      <DetailsCard
        missing="dash"
        items={[
          { label: m.district(), value: w.locality?.district?.name },
          { label: localName, value: w.locality?.name },
          { label: m.coords(), value: <CoordsLink coords={w.coords} /> },
          { label: m.fat(), value: i.fat?.name },
          { label: m.fat_port(), value: i.fatPort },
          { label: m.ont_oem(), value: i.ontOem?.name },
          { label: m.ont_serial_number(), value: i.ontSerial },
          { label: m.distance(), value: metres(i.distance) },
          { label: m.with_pole(), value: yesNo(i.withPole), missing: "hide" },
        ]}
      />
    </div>
  );
}
