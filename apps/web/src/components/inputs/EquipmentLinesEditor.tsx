import {
  DeleteOutlined,
  PlusOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  InputNumber,
  message,
  Popover,
  Table,
  type TableColumnsType,
} from "antd";
import { m } from "i18n/messages";
import { useState } from "react";
import { equipmentPageZ } from "schema/inventory";
import { filterTruthy } from "schema/utils";
import { useAuthToken } from "#/api/auth";
import { getJson, showAppError } from "#/api/helpers";
import EquipmentSelect, {
  type EquipmentOptionT,
} from "#/components/inputs/EquipmentSelect";

/** One line of a BOM, EMRF or similar list of inventory items. */
export type LineRowT = {
  key: string;
  item?: EquipmentOptionT;
  quantity?: number | null;
};

let lastKey = 0;
export function newLineRow(
  item?: EquipmentOptionT,
  quantity?: number,
): LineRowT {
  lastKey += 1;
  return { key: `line-${lastKey}`, item, quantity };
}

export function isBlankRow(row: LineRowT) {
  return !row.item && !row.quantity;
}

/** The message to show when the lines can't be sent yet, or `true`. */
export function checkLines(rows: LineRowT[]): string | true {
  const lines = rows.filter((r) => !isBlankRow(r));
  if (!lines.length) return m.bom_no_items();
  if (lines.some((r) => !r.item)) return m.bom_item_required();
  if (lines.some((r) => !((r.quantity ?? 0) >= 1))) return m.bom_qty_required();
  return true;
}

/** The filled lines, ready to send. */
export function filledLines(rows: LineRowT[]) {
  return rows.flatMap((r) =>
    r.item ? [{ item: r.item, quantity: r.quantity ?? 0 }] : [],
  );
}

type Props = {
  rows: LineRowT[];
  onChange: (rows: LineRowT[]) => void;
  showErrors: boolean;
  /** Also show each item's part number and stock, as material requests do. */
  loading?: boolean;
};

export default function EquipmentLinesEditor(props: Props) {
  const { rows, onChange, showErrors, loading } = props;
  const [pasteOpen, setPasteOpen] = useState(false);
  const used = rows.flatMap((r) => (r.item ? [r.item.id] : []));
  const filled = rows.filter((r) => r.item);
  const total = filled.reduce((sum, r) => sum + (r.quantity || 0), 0);

  function update(key: string, change: Partial<LineRowT>) {
    onChange(rows.map((r) => (r.key === key ? { ...r, ...change } : r)));
  }

  const columns: TableColumnsType<LineRowT> = filterTruthy([
    {
      title: "#",
      width: 40,
      render: (_, __, i) => <span className="opacity-60">{i + 1}</span>,
    },
    {
      title: m.bom_item(),
      render: (_, row) => (
        <EquipmentSelect
          className="w-full"
          value={row.item}
          exclude={used}
          status={showErrors && !row.item ? "error" : undefined}
          onChange={(item) => update(row.key, { item })}
        />
      ),
    },
    {
      title: m.bom_mtn_code(),
      width: 120,
      render: (_, row) => row.item?.mtnCode ?? "–",
    },
    {
      title: m.bom_ifs_code(),
      width: 120,
      render: (_, row) => row.item?.ifsCode || "–",
    },
    {
      title: m.bom_in_stock(),
      width: 80,
      align: "right",
      render: (_, row) => {
        if (!row.item) return "–";
        const short = (row.quantity || 0) > row.item.available;
        return (
          <span className={short ? "text-orange-500" : undefined}>
            {row.item.available}
          </span>
        );
      },
    },
    {
      title: m.qty(),
      width: 100,
      render: (_, row) => (
        <InputNumber
          min={1}
          precision={0}
          controls={false}
          className="w-full!"
          value={row.quantity}
          status={
            showErrors && !isBlankRow(row) && !((row.quantity ?? 0) >= 1)
              ? "error"
              : undefined
          }
          onChange={(quantity) => update(row.key, { quantity })}
        />
      ),
    },
    {
      width: 40,
      render: (_, row) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          aria-label={m.remove()}
          onClick={() => onChange(rows.filter((r) => r.key !== row.key))}
        />
      ),
    },
  ]);

  return (
    <section className="flex flex-col gap-2">
      <Table<LineRowT>
        size="small"
        rowKey="key"
        loading={loading}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 900, y: "50dvh" }}
        locale={{ emptyText: m.bom_empty() }}
        columns={columns}
      />

      <footer className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button
            icon={<PlusOutlined />}
            onClick={() => onChange([...rows, newLineRow()])}
          >
            {m.bom_add_item()}
          </Button>
          <Popover
            trigger="click"
            open={pasteOpen}
            onOpenChange={setPasteOpen}
            destroyOnHidden
            content={
              <PasteBox
                onDone={(pasted) => {
                  setPasteOpen(false);
                  onChange(mergeRows(rows, pasted));
                }}
              />
            }
          >
            <Button icon={<SnippetsOutlined />}>{m.bom_paste()}</Button>
          </Popover>
        </div>
        {filled.length > 0 && (
          <span className="text-sm opacity-70">
            {m.bom_summary({ count: filled.length, total })}
          </span>
        )}
      </footer>
    </section>
  );
}

/** Pasted items replace the quantity of rows already in the list. */
function mergeRows(rows: LineRowT[], pasted: LineRowT[]) {
  const result = rows.filter((r) => !isBlankRow(r));
  for (const p of pasted) {
    const existing = result.findIndex((r) => r.item?.id === p.item?.id);
    if (existing >= 0) result[existing] = { ...result[existing], ...p };
    else result.push(p);
  }
  return result;
}

type PastedLine = { cells: string[]; quantity: number };

function parsePaste(text: string): PastedLine[] {
  const maybeLines = text.split(/\r?\n/).map((line) => {
    const cells = line.split(/[;\t]/).filter(Boolean);
    if (cells.length < 2) return null;

    const quantity = Number(cells.pop()?.replace(/[\s,]/g, ""));
    if (!Number.isInteger(quantity) || quantity < 1) return null;

    return { cells, quantity };
  });
  console.log("Parsed", text, maybeLines);
  return filterTruthy(maybeLines);
}

const CODES_PER_REQUEST = 50;

function PasteBox(props: { onDone: (rows: LineRowT[]) => void }) {
  const token = useAuthToken();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function apply() {
    const lines = parsePaste(text);
    if (!lines.length) return;
    setBusy(true);
    try {
      // any cell might hold the code, so look them all up and keep exact matches
      const codes = [...new Set(lines.flatMap((l) => l.cells))];
      const byCode = new Map<string, EquipmentOptionT>();
      for (let i = 0; i < codes.length; i += CODES_PER_REQUEST) {
        const chunk = codes.slice(i, i + CODES_PER_REQUEST);
        const page = await getJson(
          "inventory/equipment",
          equipmentPageZ,
          { codes: chunk.join(","), pageSize: 100 },
          token.value,
        );
        for (const item of page.items) {
          byCode.set(item.mtnCode, item);
          if (item.ifsCode) byCode.set(item.ifsCode, item);
        }
      }

      const quantities = new Map<string, number>();
      const items = new Map<string, EquipmentOptionT>();
      const missing: string[] = [];
      for (const line of lines) {
        const item = line.cells.map((c) => byCode.get(c)).find(Boolean);
        if (!item) {
          missing.push(line.cells.join(" "));
          continue;
        }
        items.set(item.id, item);
        quantities.set(item.id, (quantities.get(item.id) || 0) + line.quantity);
      }

      const rows = [...items.values()].map((item) =>
        newLineRow(item, quantities.get(item.id)),
      );
      if (rows.length) message.success(m.bom_pasted({ count: rows.length }));
      if (missing.length) {
        const more = missing.length > 5 ? ` (+${missing.length - 5})` : "";
        const codes = missing.slice(0, 5).join("; ") + more;
        message.warning(m.bom_codes_not_found({ codes }));
      }
      props.onDone(rows);
    } catch (e) {
      showAppError(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 w-80">
      <p className="text-xs opacity-70">{m.bom_paste_hint()}</p>
      <Input.TextArea
        rows={8}
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="font-mono! text-xs! resize-none!"
        placeholder={"MTN-001\t12\nMTN-002\t4"}
      />
      <Button
        type="primary"
        loading={busy}
        disabled={!parsePaste(text).length}
        onClick={apply}
      >
        {m.bom_paste_apply()}
      </Button>
    </div>
  );
}
