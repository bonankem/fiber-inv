import { CloseOutlined } from "@ant-design/icons";
import {
  Button,
  Descriptions,
  Drawer,
  Steps,
  type StepsProps,
  Table,
  type TableColumnsType,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { type ReactNode, useState } from "react";
import { EmrfStatus } from "schema/enums";
import { filterTruthy } from "schema/utils";
import { type AnyActions, useActions } from "#/components/actions/types";
import StatusBadge from "#/components/StatusBadge";
import type { ModalItemFC } from "#/hooks/useModalViewer";
import { useEmrf } from "#/modules/hooks/inventory";
import EmrfStats from "./EmrfStats";
import {
  type EmrfLine,
  type EmrfRow,
  emrfCollected,
  emrfJobName,
  emrfSegments,
  emrfShortId,
  emrfTotal,
  emrfVendor,
  formatDate,
  lineOutstanding,
  lineShortfall,
} from "./emrf-utils";

type StepItem = NonNullable<StepsProps["items"]>[number];

// how far along the usual flow each status is
const reached: Record<EmrfStatus, number> = {
  REQUESTED: 0,
  PENDING: 0,
  APPROVED: 1,
  ORDERED: 2,
  COLLECTED: 3,
  CANCELLED: 0,
};

function progress(emrf: EmrfRow): StepItem[] {
  const approval =
    emrf.approvedAt &&
    filterTruthy([emrf.approvedBy?.name, formatDate(emrf.approvedAt)]).join(
      " · ",
    );
  const requested: StepItem = {
    title: "Requested",
    content: formatDate(emrf.createdAt),
    status: "finish",
  };

  if (emrf.status === EmrfStatus.CANCELLED) {
    return filterTruthy<StepItem>([
      requested,
      approval && { title: "Approved", content: approval, status: "finish" },
      {
        title: "Cancelled",
        content: formatDate(emrf.updatedAt),
        status: "error",
      },
    ]);
  }

  const at = reached[emrf.status];
  const stepStatus = (index: number) =>
    index <= at ? "finish" : index === at + 1 ? "process" : "wait";
  return [
    requested,
    {
      title: "Approved",
      content: approval || (at === 0 ? "Awaiting approval" : undefined),
      status: stepStatus(1),
    },
    { title: "Ordered", status: stepStatus(2) },
    { title: "Collected", status: stepStatus(3) },
  ];
}

function Section(props: {
  title: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <header className="flex items-baseline justify-between gap-2">
        <h3 className="m-0 text-sm font-semibold">{props.title}</h3>
        {props.extra}
      </header>
      {props.children}
    </section>
  );
}

const lineColumns: TableColumnsType<EmrfLine> = [
  {
    title: "MTN Code",
    width: 120,
    fixed: "left",
    render: (_, line) => (
      <span className="font-mono text-xs">{line.equipment.mtnCode}</span>
    ),
  },
  {
    title: "Name",
    width: 260,
    render: (_, line) => (
      <div className="flex flex-col">
        <span>{line.equipment.name}</span>
        {line.equipment.description && (
          <span className="text-xs opacity-60">
            {line.equipment.description}
          </span>
        )}
      </div>
    ),
  },
  {
    title: "IFS Code",
    width: 110,
    render: (_, line) => line.equipment.ifsCode || "—",
  },
  {
    title: "Part Number",
    width: 130,
    render: (_, line) => line.equipment.partNumber || "—",
  },
  { title: "Requested", dataIndex: "requestedQty", width: 95, align: "right" },
  { title: "Collected", dataIndex: "collectedQty", width: 90, align: "right" },
  {
    title: "Available",
    width: 120,
    align: "right",
    render: (_, line) => {
      const short = lineShortfall(line);
      if (!short) return line.equipment.available;
      return (
        <Tooltip
          title={`${lineOutstanding(line)} still to collect, ${line.equipment.available} in stock`}
        >
          <span className="inline-flex items-center gap-1">
            {line.equipment.available}
            <Tag color="warning" className="m-0!">
              −{short}
            </Tag>
          </span>
        </Tooltip>
      );
    },
  },
];

type Props = {
  emrf: EmrfRow | undefined;
  onClose: () => void;
  /** The row actions; those the user may take show in the footer. */
  actions: AnyActions<EmrfRow>;
};

export default function EmrfDrawer({ emrf, onClose, actions }: Props) {
  return (
    <Drawer
      destroyOnHidden
      onClose={onClose}
      open={!!emrf}
      size={Math.min(1040, window.innerWidth)}
      title={null}
      closable={false}
      styles={{ body: { padding: 0 } }}
    >
      {emrf && (
        <EmrfDetails initial={emrf} onClose={onClose} actions={actions} />
      )}
    </Drawer>
  );
}

function EmrfDetails(props: {
  initial: EmrfRow;
  onClose: () => void;
  actions: AnyActions<EmrfRow>;
}) {
  const { token } = theme.useToken();
  // reload so the status shows the result of an approval or revert
  const emrf = useEmrf(props.initial).data ?? props.initial;
  const actions = useActions(props.actions, emrf).filter((a) => !a.top);
  const [ActionForm, setActionForm] = useState<ModalItemFC<EmrfRow>>();
  const total = emrfTotal(emrf);
  const collected = emrfCollected(emrf);

  return (
    <div className="flex min-h-full flex-col">
      <header
        className="sticky top-0 z-10 flex items-start justify-between gap-3 px-6 py-4"
        style={{
          background: token.colorBgElevated,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold">EMRF</span>
            <Typography.Text
              copyable={{ text: emrf.id, tooltips: ["Copy full ID", "Copied"] }}
              className="font-mono text-base!"
            >
              {emrfShortId(emrf)}
            </Typography.Text>
            <StatusBadge status={emrf.status} />
          </div>
          <span
            className="truncate text-sm"
            style={{ color: token.colorTextSecondary }}
          >
            {emrfJobName(emrf) ?? "No HP Planning job linked"}
          </span>
        </div>
        <Button
          aria-label="Close"
          icon={<CloseOutlined />}
          onClick={props.onClose}
          type="text"
        />
      </header>

      <div className="flex flex-1 flex-col gap-6 px-6 py-5">
        <Steps
          items={progress(emrf)}
          responsive
          size="small"
          titlePlacement="vertical"
        />

        <EmrfStats emrf={emrf} />

        <Section title="Request details">
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2 }}
            size="small"
            items={filterTruthy([
              {
                key: "id",
                label: "EMRF ID",
                span: { xs: 1, sm: 2 },
                children: (
                  <Typography.Text copyable className="font-mono text-xs">
                    {emrf.id}
                  </Typography.Text>
                ),
              },
              {
                key: "vendor",
                label: "Vendor",
                children: emrfVendor(emrf) ?? "—",
              },
              {
                key: "area",
                label: "Area",
                children: emrf.survey?.area ?? "—",
              },
              {
                key: "segment",
                label: "Segment",
                children: emrfSegments(emrf) || "—",
              },
              {
                key: "requested",
                label: "Requested",
                children: formatDate(emrf.createdAt),
              },
              emrf.approvedBy && {
                key: "approver",
                label: "Approved by",
                children: emrf.approvedBy.name,
              },
              {
                key: "updated",
                label: "Last updated",
                children: formatDate(emrf.updatedAt),
              },
            ])}
          />
        </Section>

        <Section
          title="Requested materials"
          extra={
            <span
              className="text-xs"
              style={{ color: token.colorTextTertiary }}
            >
              {emrf.items.length} items
            </span>
          }
        >
          <Table<EmrfLine>
            columns={lineColumns}
            dataSource={emrf.items}
            pagination={false}
            rowKey="id"
            scroll={{ x: 1045 }}
            size="small"
            summary={() => (
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell index={0} colSpan={5}>
                  Total
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  {total}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right">
                  {collected}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} />
              </Table.Summary.Row>
            )}
          />
        </Section>
      </div>

      {actions.length > 0 && (
        <footer
          className="sticky bottom-0 flex justify-end gap-2 px-6 py-3"
          style={{
            background: token.colorBgElevated,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {actions.map((a) => (
            <Button
              key={a.key || a.name}
              danger={a.red}
              type={a.red ? "default" : "primary"}
              icon={a.icon ? <a.icon size={14} /> : undefined}
              onClick={() => a.form && setActionForm(() => a.form)}
            >
              {a.name}
            </Button>
          ))}
        </footer>
      )}

      {ActionForm && (
        <ActionForm
          item={emrf}
          state={{ isOpen: true, close: () => setActionForm(undefined) }}
        />
      )}
    </div>
  );
}
