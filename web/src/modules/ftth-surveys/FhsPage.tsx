import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Subset } from "schema/common";
import { StaffRole } from "schema/enums";
import { type FtthSurveyT, ftthSurveyZ } from "schema/fhs";
import { zArray } from "schema/utils";
import { getJson } from "#/api/helpers";
import DataPage from "#/components/data-page/DataPage";
import type { DtColumn } from "#/components/data-page/types";
import { subsetsDefault } from "#/components/data-page/utils";
import WithCaption from "#/components/WithCaption";

type Item = FtthSurveyT;
type Column = DtColumn<Item>;
const schema = zArray(ftthSurveyZ);

const asigneeRole = StaffRole.PLANNING_ENGINEER;
function worker(i: Item, role: StaffRole = asigneeRole) {
  return i.work.workers.find((w) => w.role === role)?.user;
}

const columns: Column[] = [
  {
    key: "id",
    title: "ID",
    width: 100,
    className: "group cursor-pointer",
    render: (p) => (
      <WithCaption
        title={<span className="group-hover:underline">{p.work.sid}</span>}
        caption={
          <span className="text-blue-500 group-hover:underline">
            Voir les détails
          </span>
        }
      />
    ),
  },
  {
    key: "name",
    title: "Nom",
    width: 200,
    render: (p) => (
      <WithCaption
        title={p.work.name}
        caption={[p.work.locality?.district?.name, p.work.locality?.name]}
      />
    ),
  },
  {
    title: "Assigné à",
    key: "assigned",
    width: 150,
    render: (t) => (
      <WithCaption
        title={worker(t)?.name || "—"}
        caption={t.work.vendor?.name}
      />
    ),
  },
];

export default function FhsPage() {
  const [subset, setSubset] = useState(Subset.TOTAL);
  const query = useQuery({
    queryFn: () => getJson("/fhs", schema),
    queryKey: ["fhs", "list"],
  });

  return (
    <DataPage
      subsets={subsetsDefault(subset, setSubset)}
      table={{ data: query.data, columns }}
    />
  );
}
