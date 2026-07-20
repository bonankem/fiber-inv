import { m } from "i18n/messages";
import type { Maybe } from "schema/utils";
import CoordsLink from "#/components/CoordsLink";
import DetailsCard from "#/components/DetailsCard";
import StatusView from "#/components/StatusView";
import type { FhcTabProps } from "./types";

function metres(m: Maybe<number>) {
  return m ? `${m} m` : null;
}

function yesNo(b: Maybe<boolean>) {
  return b === null ? null : b ? "Yes" : "No";
}

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
          { label: localName, value: w.locality?.name },
          { label: "District", value: w.locality?.district?.name },
          { label: m.field_coords(), value: <CoordsLink coords={w.coords} /> },
          { label: "FAT", value: i.fat?.name },
          { label: "FAT Port", value: i.fatPort },
          { label: "ONT OEM", value: i.ontOem?.name },
          { label: "ONT Serial Number", value: i.ontSerial },
          { label: "Cable Length", value: metres(i.cableLength) },
          { label: "New Pole", value: yesNo(i.newPole), missing: "hide" },
        ]}
      />
    </div>
  );
}
