import { Pagination, Table } from "antd";
import ExportButton from "./ExportButton";
import type { DataTableProps } from "./types";
import { useResolvedColumns } from "./utils";

export default function DataTable<T extends { id: string }>(
  props: DataTableProps<T>,
) {
  const { columns, scrollX, maxHeight } = useResolvedColumns(props);

  return (
    <Table
      size="small"
      dataSource={props.data ?? []}
      rowKey={(r) => r.id}
      scroll={{ x: scrollX }}
      loading={props.loading}
      columns={columns}
      pagination={false}
      classNames={{
        body: { cell: "text-sm one-line" },
        header: { cell: "text-sm", wrapper: "sticky top-0 z-100" },
      }}
      styles={{ content: { maxHeight, overflowY: "auto" } }}
      footer={() => (
        <footer className="flex items-center justify-between">
          <div>
            {props.onExport && <ExportButton onClick={props.onExport} />}
          </div>

          <Pagination size="small" />
        </footer>
      )}
    />
  );
}
