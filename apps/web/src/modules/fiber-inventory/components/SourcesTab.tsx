import {
  DeleteOutlined,
  EyeInvisibleOutlined,
  FileExcelOutlined,
  NodeIndexOutlined,
  PartitionOutlined,
} from "@ant-design/icons";
import { Button, Empty, Modal, message, Popconfirm, Switch } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import type { FiberSourceT } from "schema/fiber-inventory";
import { showAppError } from "#/api/helpers";
import {
  useCanEditInventory,
  useDeleteSource,
  useSetSourceLayers,
  useSetSourceVisible,
} from "../utils/api";
import LayerPicker from "./LayerPicker";

/** The files behind the map: show/hide, pick layers, delete. */
export default function SourcesTab(props: { sources: FiberSourceT[] }) {
  const canEdit = useCanEditInventory();
  const [editing, setEditing] = useState<FiberSourceT | null>(null);
  const { sources } = props;

  if (!sources.length) return <Empty description="Nothing uploaded yet" />;

  const kmz = sources.filter((s) => s.kind === "kmz");
  const sheets = sources.filter((s) => s.kind !== "kmz");
  const hidden = sources.filter((s) => !s.visible).length;
  const sum = (list: FiberSourceT[]) =>
    list.filter((s) => s.visible).reduce((n, s) => n + s.count, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        <Stat
          value={sources.length}
          label="files"
          sub={hidden ? `${hidden} hidden` : "all shown"}
        />
        <Stat value={sum(kmz)} label="features" sub={`${kmz.length} KMZ`} />
        <Stat
          value={sum(sheets)}
          label="sites"
          sub={`${sheets.length} sheets`}
        />
      </div>

      {!canEdit && (
        <p className="m-0 text-xs opacity-60">
          Only staff can change the files on the map.
        </p>
      )}

      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {[...sources].reverse().map((s) => (
          <SourceCard
            key={s.id}
            source={s}
            canEdit={canEdit}
            onEditLayers={() => setEditing(s)}
          />
        ))}
      </ul>

      {editing && (
        <LayersModal source={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function Stat(props: { value: number; label: string; sub: string }) {
  return (
    <div className="flex flex-col rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800/70">
      <span className="text-lg font-bold leading-tight tabular-nums">
        {props.value.toLocaleString()}
      </span>
      <span className="text-xs font-medium">{props.label}</span>
      <span className="text-[10px] opacity-60">{props.sub}</span>
    </div>
  );
}

function SourceCard(props: {
  source: FiberSourceT;
  canEdit: boolean;
  onEditLayers: () => void;
}) {
  const { source: s, canEdit } = props;
  const visible = useSetSourceVisible();
  const del = useDeleteSource();
  const isKmz = s.kind === "kmz";
  const hasLayers = isKmz && s.layers.length > 1;
  const shownLayers = s.layers.length - s.excludedLayers.length;

  const run = async (p: Promise<unknown>, ok?: string) => {
    try {
      await p;
      if (ok) message.success(ok);
    } catch (e) {
      showAppError(e);
    }
  };

  return (
    <li
      className={`group overflow-hidden rounded-xl border bg-white transition-colors dark:bg-zinc-900 ${
        s.visible
          ? "border-zinc-200 dark:border-zinc-700"
          : "border-dashed border-zinc-300 dark:border-zinc-600"
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${
            isKmz
              ? "bg-yellow-400/15 text-[#c99a00] dark:text-brand"
              : "bg-green-500/15 text-green-600 dark:text-green-400"
          } ${s.visible ? "" : "opacity-50"}`}
        >
          {isKmz ? <NodeIndexOutlined /> : <FileExcelOutlined />}
        </span>

        <div
          className={`flex min-w-0 grow flex-col ${s.visible ? "" : "opacity-60"}`}
        >
          <span className="truncate font-semibold leading-snug" title={s.name}>
            {s.name}
          </span>
          <span className="text-xs opacity-60">
            {isKmz ? "KMZ network" : "Site list"} · {s.count.toLocaleString()}{" "}
            {isKmz ? "features" : "sites"} ·{" "}
            {dayjs(s.createdAt).format("D MMM YYYY")}
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-0.5">
          <Switch
            size="small"
            checked={s.visible}
            aria-label={`Show ${s.name} on the map`}
            disabled={!canEdit}
            loading={visible.isPending}
            onChange={(v) => run(visible.mutateAsync({ id: s.id, visible: v }))}
          />
          <span className="text-[10px] opacity-60">
            {s.visible ? (
              "On map"
            ) : (
              <>
                <EyeInvisibleOutlined /> Hidden
              </>
            )}
          </span>
        </div>
      </div>

      {hasLayers && (
        <div className="flex items-center gap-2 px-3 pb-3">
          <div className="h-1.5 grow overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${(shownLayers / s.layers.length) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-[10px] tabular-nums opacity-60">
            {shownLayers}/{s.layers.length} layers shown
          </span>
        </div>
      )}

      {canEdit && (
        <div className="flex items-center justify-end gap-1 border-t border-zinc-100 bg-zinc-50/60 px-2 py-1 dark:border-zinc-800 dark:bg-zinc-800/30">
          {hasLayers && (
            <Button
              size="small"
              type="text"
              icon={<PartitionOutlined />}
              onClick={props.onEditLayers}
            >
              Layers
            </Button>
          )}
          <Popconfirm
            title="Delete this file?"
            description="It is removed from the map and from storage."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() =>
              run(del.mutateAsync({ id: s.id }), `Deleted ${s.name}`)
            }
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={del.isPending}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      )}
    </li>
  );
}

function LayersModal(props: { source: FiberSourceT; onClose: () => void }) {
  const { source } = props;
  const [excluded, setExcluded] = useState(
    () => new Set(source.excludedLayers),
  );
  const save = useSetSourceLayers();

  const onSave = async () => {
    if (excluded.size >= source.layers.length) {
      message.warning("Keep at least one layer");
      return;
    }
    try {
      await save.mutateAsync({ id: source.id, excludedLayers: [...excluded] });
      message.success("Layers updated");
      props.onClose();
    } catch (e) {
      showAppError(e);
    }
  };

  return (
    <Modal
      open
      title={`Layers · ${source.name}`}
      okText="Apply"
      onOk={onSave}
      confirmLoading={save.isPending}
      onCancel={props.onClose}
      width={560}
    >
      <p className="mb-3 text-xs opacity-70">
        Untick drawing layers (hatching, legend, title block, text) to keep only
        the network. The file is re-read from storage, so nothing needs to be
        uploaded again.
      </p>
      <LayerPicker
        layers={source.layers}
        excluded={excluded}
        onChange={setExcluded}
        maxHeight={360}
      />
    </Modal>
  );
}
