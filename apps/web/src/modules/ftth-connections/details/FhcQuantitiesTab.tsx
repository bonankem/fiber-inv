import { m } from "i18n/messages";
import type { FhcCostT, FtthConnectionT } from "schema/fhc";
import DataTable from "#/components/data-page/DataTable";
import FhcPbNameView from "../components/FchPbNameView";

type Props = {
  item: FtthConnectionT;
  cost: FhcCostT;
};

export default function FhcQuantitiesTab(props: Props) {
  return (
    <DataTable
      smallerText
      data={props.cost.quantities}
      columns={[
        {
          key: "ref",
          title: "Ref",
          width: 120,
          render: (c) => c.item.ref,
        },
        {
          key: "qty",
          title: m.qty(),
          width: 60,
          render: (c) => c.quantity,
          className: "text-right",
        },
        {
          key: "name",
          title: m.name(),
          width: 500,
          render: (c) => <FhcPbNameView item={c.item} />,
        },
      ]}
    />
  );
}
