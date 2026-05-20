import { Subset } from "schema/common";
import { StaffRole } from "schema/enums";
import { type FtthSurveyT, fhsFilterZ, ftthSurveyZ } from "schema/fhs";
import { zArray } from "schema/utils";
import DataPage from "#/components/data-page/DataPage";
import type { DtColumn } from "#/components/data-page/types";
import { subsetsDefault } from "#/components/data-page/utils";
import StatusView from "#/components/StatusView";
import WithCaption from "#/components/WithCaption";
import { useApiQuery } from "#/hooks/useApiQuery";
import { shortName } from "#/utils/names";
import { fhsActions } from "./fhs-actions";

type Item = FtthSurveyT;
type Column = DtColumn<Item>;

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
    width: 250,
    render: (p) => (
      <WithCaption
        title={p.work.name}
        caption={[p.work.locality?.district?.name, p.work.locality?.name]}
      />
    ),
  },
  {
    title: "Statut",
    key: "status",
    width: 150,
    render: (t) => (
      <StatusView
        work={t.work}
        pendingOn={{
          REQUESTED: "PLANNING_MANAGER",
          ASSIGNED: "PLANNING_ENGINEER",
          ONGOING: "VENDOR",
          REVIEW: "PLANNING_ENGINEER",
          REVIEW_FAILED: "VENDOR",
        }}
      />
    ),
  },
  {
    title: "Assigné à",
    key: "assigned",
    width: 150,
    render: (t) => (
      <WithCaption
        title={shortName(worker(t)?.name)}
        caption={t.work.vendor?.name}
      />
    ),
  },
];

export default function FhsPage() {
  const api = useApiQuery({
    url: "/fhs",
    input: fhsFilterZ,
    output: zArray(ftthSurveyZ),
    defaults: { subset: Subset.TOTAL },
  });

  return (
    <DataPage
      table={{ data: api.query.data, columns, actions: fhsActions }}
      subsets={subsetsDefault(api.dto.subset, api.setter("subset"))}
    />
  );
}
