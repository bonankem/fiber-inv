import { m } from "i18n/messages";
import { workDocZ } from "schema/work";
import { downloadUrl, useApiGet } from "#/api/helpers";
import type { FhcTabProps } from "./types";

const names = {
  FHC_CABLE_AT_FAT: m.fhc_cable_at_fat(),
  FHC_FAT_POWER_TEST: m.fhc_fat_power_test(),
  FHC_CABLE_AT_CUSTOMER: m.fhc_cable_at_customer(),
  FHC_ATB_POWER_TEST: m.fhc_atb_power_test(),
  FHC_ONT_INDICATORS: m.fhc_ont_indicators(),
  FHC_ONT_NAMEPLATE: m.fhc_ont_nameplate(),
  FHC_SPEED_TEST: m.fhc_speed_test(),
  FHC_POLE: m.fhc_pole(),
};

export default function FhcImagesTab(props: FhcTabProps) {
  const i = props.item;
  const query = useApiGet(["work", i.id, "docs"], workDocZ.array());
  const items = (query.data || [])?.filter((i) =>
    i.upload.type.startsWith("image/"),
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-1 overflow-hidden rounded-md">
      {items.map((i) => {
        const url = downloadUrl(i.upload);
        const name =
          names[i.type as keyof typeof names] ||
          i.type?.replace("FHC_", "").replace(/_/g, " ");
        return (
          <a
            href={url}
            key={i.id}
            target="_blank"
            rel="noopener noreferrer"
            className="relative overflow-hidden last:rounded-br-md aspect-3/4"
          >
            <img src={url} alt={name} className="w-full h-full object-cover" />
            <div className="bg-black/50 text-white/80 px-3 py-1 w-full bottom-0 absolute text-nowrap text-ellipsis overflow-hidden">
              {name}
            </div>
          </a>
        );
      })}
    </div>
  );
}
