import {
  DownOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { type ReactNode, useState } from "react";
import type { FiberInventoryItemT, FiberSiteT } from "schema/fiber-inventory";
import {
  isManhole,
  MANHOLE_COLORS,
  MANHOLE_STATUS_LABELS,
  type ManholeStatusKey,
  manholeStatusKey,
} from "../utils/manholes";
import {
  manholeIconUrl,
  POINT_COLOR,
  ROUTE_COLOR,
  SITE_COLORS,
  ZONE_COLOR,
} from "../utils/map-style";

type Entry = {
  key: string;
  swatch: ReactNode;
  label: string;
  hint?: string;
  count: number;
};

const Svg = ({ children }: { children: ReactNode }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    {children}
  </svg>
);

const zoneSwatch = (
  <Svg>
    <rect
      x="2"
      y="3"
      width="14"
      height="12"
      rx="2"
      fill={ZONE_COLOR}
      fillOpacity="0.25"
      stroke={ZONE_COLOR}
      strokeWidth="2"
    />
  </Svg>
);

const routeSwatch = (
  <Svg>
    <path
      d="M2 13 L7 6 L11 11 L16 4"
      fill="none"
      stroke={ROUTE_COLOR}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const pointSwatch = (
  <Svg>
    <circle
      cx="9"
      cy="9"
      r="4.5"
      fill={POINT_COLOR}
      stroke="#18181b"
      strokeOpacity="0.85"
      strokeWidth="1.5"
    />
  </Svg>
);

const siteSwatch = (color: string) => (
  <Svg>
    <path
      d="M9 2 L15 9 L9 16 L3 9 Z"
      fill={color}
      stroke="#fff"
      strokeWidth="1.5"
    />
  </Svg>
);

const manholeSwatch = (color: string) => (
  <img src={manholeIconUrl(color)} width={18} height={18} alt="" />
);

const MANHOLE_ORDER: ManholeStatusKey[] = ["existing", "new", "unknown"];

/**
 * Explains the map symbols and lists only what is actually on the map; each
 * row also shows or hides its symbols.
 */
export default function MapLegend(props: {
  items: FiberInventoryItemT[];
  sites: FiberSiteT[];
  hidden: Set<string>;
  onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const { items, sites } = props;

  const count = (f: (i: FiberInventoryItemT) => boolean) =>
    items.filter(f).length;
  const manholeCount = (s: ManholeStatusKey) =>
    count((i) => isManhole(i) && manholeStatusKey(i) === s);
  const matched = sites.filter((s) => s.matchedFeature).length;

  const entries: Entry[] = [
    {
      key: "zone",
      swatch: zoneSwatch,
      label: "Zone",
      hint: "Service area polygon",
      count: count((i) => i.kind === "polygon"),
    },
    {
      key: "route",
      swatch: routeSwatch,
      label: "Route",
      hint: "Fiber cable path",
      count: count((i) => i.kind === "line"),
    },
    ...MANHOLE_ORDER.map((s) => ({
      key: `manhole-${s}`,
      swatch: manholeSwatch(MANHOLE_COLORS[s]),
      label: `Manhole · ${MANHOLE_STATUS_LABELS[s]}`,
      hint: "Chambre / regard (zoom in to see)",
      count: manholeCount(s),
    })),
    {
      key: "point",
      swatch: pointSwatch,
      label: "Network point",
      hint: "Other KMZ point: POP, BPE, FAT or drawing label",
      count: count((i) => i.kind === "point" && !isManhole(i)),
    },
    {
      key: "site-ok",
      swatch: siteSwatch(SITE_COLORS.matched),
      label: "Site · matched",
      hint: "Linked to a zone, route or point",
      count: matched,
    },
    {
      key: "site-no",
      swatch: siteSwatch(SITE_COLORS.unmatched),
      label: "Site · unmatched",
      hint: "No network within range",
      count: sites.length - matched,
    },
  ].filter((e) => e.count > 0);

  if (!entries.length) return null;

  return (
    <div className="absolute left-3 bottom-8 z-10 w-60 rounded-xl border border-zinc-200 bg-white/95 text-zinc-800 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95 dark:text-zinc-100">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider"
        title="Click a row to show or hide it"
        aria-expanded={open}
      >
        Legend
        {open ? (
          <DownOutlined className="text-[10px]" />
        ) : (
          <UpOutlined className="text-[10px]" />
        )}
      </button>
      {open && (
        <ul className="m-0 flex list-none flex-col gap-0.5 border-t border-zinc-200 px-3 py-2 dark:border-zinc-700">
          {entries.map((e) => {
            const off = props.hidden.has(e.key);
            return (
              <li key={e.key}>
                <button
                  type="button"
                  onClick={() => props.onToggle(e.key)}
                  title={`${off ? "Show" : "Hide"} · ${e.hint ?? e.label}`}
                  aria-pressed={!off}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-md px-1 py-0.5 text-left transition-opacity hover:bg-zinc-100 dark:hover:bg-zinc-800 ${off ? "opacity-40" : ""}`}
                >
                  <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
                    {e.swatch}
                  </span>
                  <span className="flex min-w-0 grow flex-col leading-tight">
                    <span
                      className={`text-xs font-medium ${off ? "line-through" : ""}`}
                    >
                      {e.label}
                    </span>
                    {e.hint && (
                      <span className="truncate text-[10px] opacity-60">
                        {e.hint}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-1.5 text-[10px] tabular-nums dark:bg-zinc-800">
                    {e.count.toLocaleString()}
                  </span>
                  {off ? (
                    <EyeInvisibleOutlined className="shrink-0 text-[11px]" />
                  ) : (
                    <EyeOutlined className="shrink-0 text-[11px] opacity-50" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
