import { Grid, type TableColumnType } from "antd";
import { m } from "i18n/messages";
import { useCallback, useMemo } from "react";
import { sumBy } from "remeda";
import { Subset, type SubsetCounts } from "schema/common";
import type { Maybe } from "schema/utils";
import { useModalViewer } from "#/hooks/useModalViewer";
import ActionsButton from "../actions/ActionsButton";
import type { DataTableProps, DtColumn } from "./types";

export function useResolvedColumns<T>(props: DataTableProps<T>) {
  const bp = Grid.useBreakpoint();
  const screen = bp.xxl ? "large" : bp.md ? "normal" : "mobile";
  const modals = useModalViewer();

  const onRow = useCallback(
    (f: DtColumn<T>["onClick"]) => {
      if (!f) return undefined;

      const className = "cursor-pointer hover:underline decoration-gray-300";
      if (typeof f === "function") {
        return (t: T) => ({ onClick: () => f(t, modals), className });
      }
      const m = props.modal;
      if (!m) return undefined;
      return (t: T) => ({ onClick: () => modals.openWith(m, t), className });
    },
    [modals, props.modal],
  );

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
      title: mobile ? "" : m.action(),
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
        onCell: onRow(col.onClick),
        render: (_, t) => col.render(t),
        sorter:
          col.sorter &&
          ((a, b) => {
            const va = col.sorter?.(a);
            const vb = col.sorter?.(b);
            if (!vb) return -1;
            if (!va) return +1;
            if (typeof va === "string" || typeof vb === "string") {
              const sa = va.toString();
              const sb = vb.toString();
              return sa.localeCompare(sb, undefined, {
                numeric: true,
                sensitivity: "base",
              });
            }
            return va - vb;
          }),
      })),
      ...(actionCol ? [actionCol] : []),
    ];
  }, [props.columns, props.onMobile, screen, props.actions, onRow]);

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
  { key: Subset.TOTAL, label: m.subset_total() },
  { key: Subset.MY_PENDING, label: m.subset_mine() },
  { key: Subset.OPEN, label: m.subset_open() },
  { key: Subset.STOPPED, label: m.subset_stopped() },
  { key: Subset.CLOSED, label: m.subset_closed() },
];

export function subsetsDefault(
  selected: Maybe<Subset>,
  onSelect: (s: Subset) => void,
  counts?: SubsetCounts,
) {
  return {
    items: defaultSubsets,
    selected: selected || Subset.TOTAL,
    onSelect,
    counts,
  };
}
