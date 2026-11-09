import { Button, Checkbox, Input, Tag, Tooltip } from "antd";
import { useMemo, useState } from "react";
import { type FiberLayerT, isNoiseLayer } from "schema/fiber-inventory";

/**
 * Ticks which KMZ layers go on the map. CAD drawing layers (hatching, legend,
 * title block, text...) are flagged so they're easy to leave out.
 */
export default function LayerPicker(props: {
  layers: FiberLayerT[];
  excluded: Set<string>;
  onChange: (excluded: Set<string>) => void;
  maxHeight?: number;
}) {
  const { layers, excluded, onChange } = props;
  const [search, setSearch] = useState("");

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? layers.filter((l) => l.name.toLowerCase().includes(q)) : layers;
  }, [layers, search]);

  const kept = layers.filter((l) => !excluded.has(l.name));
  const keptFeatures = kept.reduce((s, l) => s + l.count, 0);
  const total = layers.reduce((s, l) => s + l.count, 0);

  const toggle = (name: string, on: boolean) => {
    const next = new Set(excluded);
    if (on) next.delete(name);
    else next.add(name);
    onChange(next);
  };
  const setAll = (names: string[], on: boolean) => {
    const next = new Set(excluded);
    for (const n of names) {
      if (on) next.delete(n);
      else next.add(n);
    }
    onChange(next);
  };

  if (layers.length <= 1) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span>
          <strong>{kept.length}</strong> of {layers.length} layers ·{" "}
          {keptFeatures.toLocaleString()} / {total.toLocaleString()} features
        </span>
        <span className="flex gap-1">
          <Button
            size="small"
            type="link"
            className="px-1!"
            onClick={() =>
              setAll(
                shown.map((l) => l.name),
                true,
              )
            }
          >
            All
          </Button>
          <Button
            size="small"
            type="link"
            className="px-1!"
            onClick={() =>
              setAll(
                shown.map((l) => l.name),
                false,
              )
            }
          >
            None
          </Button>
          <Tooltip title="Leave out hatching, legends, title blocks, text and other drawing-only layers">
            <Button
              size="small"
              type="link"
              className="px-1!"
              onClick={() =>
                onChange(
                  new Set(
                    layers
                      .filter((l) => isNoiseLayer(l.name))
                      .map((l) => l.name),
                  ),
                )
              }
            >
              Network only
            </Button>
          </Tooltip>
        </span>
      </div>
      {layers.length > 8 && (
        <Input.Search
          size="small"
          allowClear
          placeholder="Filter layers"
          onChange={(e) => setSearch(e.target.value)}
        />
      )}
      <ul
        className="m-0 flex list-none flex-col gap-0.5 overflow-y-auto rounded-lg border border-zinc-200 p-1.5 dark:border-zinc-700"
        style={{ maxHeight: props.maxHeight ?? 220 }}
      >
        {shown.map((l) => (
          <li
            key={l.name}
            className="flex items-center gap-2 rounded px-1 py-0.5 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <Checkbox
              checked={!excluded.has(l.name)}
              onChange={(e) => toggle(l.name, e.target.checked)}
            />
            <span className="min-w-0 grow truncate text-xs" title={l.name}>
              {l.name}
            </span>
            {isNoiseLayer(l.name) && (
              <Tag className="m-0! text-[10px]" color="default">
                drawing
              </Tag>
            )}
            <span className="shrink-0 rounded-full bg-zinc-100 px-1.5 text-[10px] tabular-nums dark:bg-zinc-800">
              {l.count.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
