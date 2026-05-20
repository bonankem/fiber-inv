import { Grid, type TableColumnType } from "antd";
import { useMemo } from "react";
import { sumBy } from "remeda";
import { Subset } from "schema/common";
import type { Maybe } from "schema/utils";
import ActionsButton from "../actions/ActionsButton";
import type { DataTableProps } from "./types";

export function useResolvedColumns<T>(props: DataTableProps<T>) {
  const bp = Grid.useBreakpoint();
  const screen = bp.xxl ? "large" : bp.md ? "normal" : "mobile";

  type Col = TableColumnType<T>;
  const columns = useMemo((): Col[] => {
    const mobile = screen === "mobile";
    const onMobile = props.onMobile;

    const cols = mobile && onMobile ? [onMobile] : (props.columns ?? []);
    if (!cols.length) return [];

    const actions = props.actions;

    const actionCol: Col | undefined = actions && {
      key: "action",
      width: mobile ? 40 : 60,
      title: mobile ? "" : "Action",
      fixed: "right",
      align: "center",
      render: (t) => <ActionsButton actions={actions} item={t} />,
    };

    return [
      ...cols.map<Col>((col) => ({
        key: col.key,
        width: col.width,
        title: col.title,
        className: col.className,
        render: (_, t) => col.render(t),
      })),
      ...(actionCol ? [actionCol] : []),
    ];
  }, [props.columns, props.onMobile, screen, props.actions]);

  const scrollX = useMemo(() => {
    const fallback = 150;
    return sumBy(columns, (c) => {
      const w = c.width || fallback;
      if (typeof w === "number") return w;
      return Number(/(\d+)px/.exec(w)?.[1]) || fallback;
    });
  }, [columns]);

  // 100dvh-220px is roughly the amount of available vertical space for
  // the table accounting for the page header, footer, and subset cards
  const maxHeight = props.maxHeight || "calc(100dvh-220px)";
  return { columns, scrollX, maxHeight };
}

const defaultSubsets = [
  { key: Subset.TOTAL, label: "Toutes" },
  { key: Subset.MY_PENDING, label: "Mes tâches" },
  { key: Subset.OPEN, label: "Ouvertes" },
  { key: Subset.STOPPED, label: "Écartées" },
  { key: Subset.CLOSED, label: "Terminées" },
];

export function subsetsDefault(
  selected: Maybe<Subset>,
  onSelect: (s: Subset) => void,
) {
  return {
    items: defaultSubsets,
    selected: selected || Subset.TOTAL,
    onSelect,
  };
}
