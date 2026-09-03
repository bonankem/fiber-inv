import { m } from "i18n/messages";
import CoordsLink from "#/components/CoordsLink";
import DetailsCard from "#/components/DetailsCard";
import StatusView from "#/components/StatusView";
import { metres, yesNo } from "#/utils/details";
import { fhcModeNames } from "../fhc-types";
import type { FhcTabProps } from "./types";

function slotPort(slot: number | null, port: number | null) {
  return slot && port ? `${slot}/${port}` : null;
}

export default function FhcDetailsTab(props: FhcTabProps) {
  const i = props.item;
  const w = i.work;
  const isAbidjan = w.locality?.district?.name === "Abidjan";
  const localName = isAbidjan ? m.commune() : m.department();
  const modeLabel = i.mode && fhcModeNames[i.mode];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DetailsCard
        missing="hide"
        items={[
          { label: m.name(), value: w.name },
          { label: "TN", value: i.tn && `${i.tn}@mtn.ci` },
          { label: m.field_vendor(), value: w.vendor?.name },
          { label: m.id(), value: w.sid },
          { label: m.phone(), value: i.phone },
          { label: m.email(), value: i.email },
          { label: m.district(), value: w.locality?.district?.name },
          { label: localName, value: w.locality?.name },
          { label: m.coords(), value: <CoordsLink coords={w.coords} /> },
        ]}
      />
      <DetailsCard
        missing="hide"
        items={[
          { label: m.status(), value: <StatusView work={w} smaller /> },
          { label: m.fat(), value: i.fat?.name },
          { label: m.fat_port(), value: i.fatPort },
          { label: "OLT", value: i.olt?.name },
          { label: m.olt_slot_port(), value: slotPort(i.oltSlot, i.oltPort) },
          { label: m.ont_serial_number(), value: i.ontSerial },
          { label: m.ont_oem(), value: i.ontOem?.name },
          { label: m.mode_of_cabling(), value: modeLabel },
          { label: m.distance(), value: metres(i.distance || null) },
          { label: m.pole(), value: yesNo(i.withPole) },
        ]}
      />
    </div>
  );
}
