import { Pagination, Table } from "antd";
import { twJoin } from "tailwind-merge";
import ExportButton from "./ExportButton";
import type { DataTableProps } from "./types";
import { useResolvedColumns } from "./utils";

export default function DataTable<T extends { id: string } | { tn: string }>(
  props: DataTableProps<T>,
) {
  const { columns, scrollX, maxHeight } = useResolvedColumns(props);
  const hasFooter = props.footer || props.onExport;
  const textClass = props.smallerText ? "text-xs!" : "text-sm!";

  return (
    <Table
      size="small"
      virtual={props.virtual}
      className={props.className}
      dataSource={props.data ?? []}
      rowKey={(r) => ("id" in r ? r.id : r.tn)}
      scroll={{
        x: scrollX,
        y: props.inModal ? "calc(max(200px,40vh))" : "calc(max(400px,60vh))",
      }}
      loading={props.loading}
      columns={columns}
      pagination={false}
      classNames={{
        body: {
          cell: twJoin(
            textClass,
            !props.multiLine && "one-line",
            props.cellClassName,
          ),
        },
        header: { cell: textClass, wrapper: "sticky top-0 z-100" },
      }}
      bordered={props.bordered}
      styles={{ content: { maxHeight, overflowY: "auto" } }}
      footer={
        hasFooter
          ? () => (
              <footer className="flex items-center justify-between">
                <div>
                  {props.footer && <div>{props.footer}</div>}
                  {props.onExport && <ExportButton onClick={props.onExport} />}
                </div>

                <Pagination size="small" />
              </footer>
            )
          : undefined
      }
    />
  );
}
