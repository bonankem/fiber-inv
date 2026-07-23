import { m } from "i18n/messages";
import type { FtthConnectionT } from "schema/fhc";
import type { DtColumn } from "#/components/data-page/types";
import StatusView from "#/components/StatusView";
import WithCaption from "#/components/WithCaption";

export type fhcColumn = DtColumn<FtthConnectionT>;

export const fhcColumns: fhcColumn[] = [
  {
    key: "id",
    title: "ID",
    width: 100,
    onClick: true,
    render: (p) => (
      <WithCaption
        title={<span>{p.work.sid}</span>}
        caption={<span className="text-blue-400">Voir les détails</span>}
      />
    ),
  },
  {
    key: "name",
    title: m.name(),
    width: 200,
    onClick: true,
    render: (p) => (
      <WithCaption
        title={p.work.name}
        caption={[p.work.locality?.district?.name, p.work.locality?.name]}
      />
    ),
  },
  {
    key: "status",
    title: m.status_pending_on(),
    width: 150,
    render: (t) => (
      <StatusView
        work={t.work}
        pendingOn={{
          REQUESTED: "VENDOR",
          REVIEW: "HOME_INTERNET",
          FAILED: "VENDOR",
        }}
      />
    ),
  },
  {
    key: "vendor",
    title: m.field_vendor(),
    width: 150,
    render: (t) => t.work.vendor?.name,
  },
];
