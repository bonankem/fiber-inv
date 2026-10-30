import { Table } from "antd";
import { m } from "i18n/messages";
import type { FhsBomItemT } from "schema/fhs";
import type { FhsTabProps } from "./types";

export default function FhsBomTab(props: FhsTabProps) {
  const bom = props.full?.bom ?? [];
  const total = bom.reduce((sum, b) => sum + b.quantity, 0);

  return (
    <section className="flex flex-col gap-2">
      <Table<FhsBomItemT>
        size="small"
        rowKey="id"
        loading={props.loading}
        dataSource={bom}
        pagination={false}
        scroll={{ x: 640, y: "55dvh" }}
        columns={[
          {
            title: "#",
            width: 40,
            render: (_, __, i) => <span className="opacity-60">{i + 1}</span>,
          },
          {
            title: m.bom_item(),
            render: (_, b) => (
              <div className="flex flex-col">
                <span>{b.equipment.name}</span>
                {b.equipment.description && (
                  <span className="text-xs opacity-60">
                    {b.equipment.description}
                  </span>
                )}
              </div>
            ),
          },
          {
            title: m.bom_mtn_code(),
            width: 120,
            render: (_, b) => b.equipment.mtnCode,
          },
          {
            title: m.bom_ifs_code(),
            width: 120,
            render: (_, b) => b.equipment.ifsCode ?? "–",
          },
          {
            title: m.qty(),
            width: 80,
            align: "right",
            render: (_, b) => b.quantity,
          },
        ]}
      />
      <span className="self-end text-sm opacity-70">
        {m.bom_summary({ count: bom.length, total })}
      </span>
    </section>
  );
}
