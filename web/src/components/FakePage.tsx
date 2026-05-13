import { useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Subset } from "schema/common";
import DataPage from "./data-page/DataPage";
import type { DtColumn } from "./data-page/types";
import { subsetsDefault } from "./data-page/utils";
import WithCaption from "./WithCaption";

export default function FakePage() {
  const [subset, setSubset] = useState(Subset.TOTAL);

  type Col = DtColumn<Record<string, string>>;

  const columns = [
    {
      title: "ID",
      key: "sid",
      width: 120,
      render: (t) => t.sid,
    },
    {
      title: "Nom",
      key: "name",
      width: "calc(min(200px,40dvw))",
      render: (t) => <WithCaption title={t.name} caption={t.locality} />,
    },
    {
      title: "Assigné à",
      key: "assigned",
      width: 150,
      render: (t) => <WithCaption title={t.engineer} caption={t.vendor} />,
    },
    {
      title: "Statut",
      key: "status",
      width: 150,
      render: (t) => <WithCaption title={t.status} caption={t.vendor} />,
    },
  ] satisfies Col[];

  const onMobile: Col = {
    key: "info",
    title: "Info",
    render: (t) => <WithCaption title={t.name} caption={t.locality} />,
  };

  const hasSubsets = /ftth/.test(useLocation().pathname);
  return (
    <DataPage
      table={{ data: [], columns, onMobile }}
      subsets={hasSubsets && subsetsDefault(subset, setSubset)}
    />
  );
}
