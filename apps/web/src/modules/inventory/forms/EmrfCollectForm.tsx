import {
  Form,
  Input,
  InputNumber,
  message,
  Table,
  type TableColumnsType,
} from "antd";
import { useState } from "react";
import { apiCall } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import type { ModalItemProps } from "#/hooks/useModalViewer";
import { useCollectEmrf } from "#/modules/hooks/inventory";
import { type EmrfLine, type EmrfRow, emrfJobName } from "../emrf-utils";

type Fields = { comment?: string };

/** Default to what was requested, capped by what the warehouse has. */
function defaultQty(line: EmrfLine) {
  return Math.min(line.requestedQty, line.equipment.available);
}

export default function EmrfCollectForm(props: ModalItemProps<EmrfRow>) {
  const collect = useCollectEmrf();
  const [qtys, setQtys] = useState<Record<string, number>>(() =>
    Object.fromEntries(props.item.items.map((l) => [l.id, defaultQty(l)])),
  );

  const onSubmit = apiCall(async ({ comment }: Fields) => {
    await collect.mutateAsync({
      id: props.item.id,
      // an EMRF is collected in one go, so every line is sent
      items: props.item.items.map((line) => ({
        itemId: line.id,
        collectedQty: qtys[line.id] ?? 0,
      })),
      comment: comment?.trim() || undefined,
      uploads: [],
    });
    message.success("Collection recorded");
    props.state.close();
  });

  const columns: TableColumnsType<EmrfLine> = [
    {
      title: "Item",
      render: (_, line) => (
        <div className="flex flex-col">
          <span>{line.equipment.name}</span>
          <span className="text-xs opacity-60">{line.segment}</span>
        </div>
      ),
    },
    {
      title: "Requested",
      dataIndex: "requestedQty",
      width: 95,
      align: "right",
    },
    {
      title: "In stock",
      width: 85,
      align: "right",
      render: (_, line) => line.equipment.available,
    },
    {
      title: "Collected",
      width: 120,
      render: (_, line) => (
        <InputNumber
          min={0}
          max={Math.min(line.requestedQty, line.equipment.available)}
          precision={0}
          value={qtys[line.id]}
          onChange={(v) => setQtys((q) => ({ ...q, [line.id]: v ?? 0 }))}
          className="w-full"
        />
      ),
    },
  ];

  return (
    <FormModal<Fields>
      title="Record collection"
      subtitle={emrfJobName(props.item)}
      state={props.state}
      width={760}
      okText="Record collection"
      checkbox="I have collected these quantities from the warehouse"
      submitting={collect.isPending}
      onSubmit={onSubmit}
    >
      <p className="m-0 text-xs opacity-70">
        TO number: <strong>{props.item.orderNumber}</strong>. Enter what you
        actually received; it can be less than requested if stock was short.
      </p>
      <Table<EmrfLine>
        rowKey="id"
        size="small"
        pagination={false}
        columns={columns}
        dataSource={props.item.items}
      />
      <Form.Item<Fields> label="Comment" name="comment">
        <Input.TextArea rows={2} maxLength={5000} placeholder="Optional" />
      </Form.Item>
    </FormModal>
  );
}
