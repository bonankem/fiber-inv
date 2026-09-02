import { m } from "i18n/messages";
import type { FtthConnectionT } from "schema/fhc";
import type { DtColumn } from "#/components/data-page/types";
import StatusView from "#/components/StatusView";
import WithCaption from "#/components/WithCaption";

export type FhcColumn = DtColumn<FtthConnectionT>;

function caption(f: FtthConnectionT) {
  const l = f.work.locality;
  return l ? [l.district.name, l.name] : null;
}

export const fhcColumns: FhcColumn[] = [
  {
    key: "id",
    title: "ID",
    width: 140,
    onClick: true,
    render: (p) => (
      <WithCaption
        title={<span>{p.work.sid}</span>}
        caption={<span className="text-blue-400">Voir les détails</span>}
      />
    ),
  },
  {
    key: "tn",
    title: `TN`,
    width: 140,
    onClick: true,
    render: (p) => <WithCaption title={p.tn} caption={p.fat?.name || "-"} />,
  },
  {
    key: "name",
    title: m.name(),
    width: 250,
    onClick: true,
    render: (p) => <WithCaption title={p.work.name} caption={caption(p)} />,
  },
  {
    key: "status",
    title: m.status_pending_on(),
    width: 200,
    render: (t) => (
      <StatusView
        work={t.work}
        pendingOn={{
          SURVEY: "VENDOR",
          INSTALLATION: "VENDOR",
          REVIEW: "HOME_INTERNET",
          FAILED_REVIEW: "VENDOR",
        }}
      />
    ),
  },
  {
    key: "vendor",
    title: m.field_vendor(),
    width: 120,
    render: (t) => t.work.vendor?.name,
  },
];
