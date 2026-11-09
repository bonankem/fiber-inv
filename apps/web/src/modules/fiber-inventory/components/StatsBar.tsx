import {
  DownOutlined,
  EnvironmentFilled,
  NodeIndexOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Button, Popover, Tooltip } from "antd";
import { type ReactNode, useMemo, useState } from "react";
import {
  type FiberInventoryItemT,
  type FiberSiteT,
  lineLengthM,
} from "schema/fiber-inventory";
import { isManhole, MANHOLE_COLORS, manholeStatusKey } from "../utils/manholes";
import { manholeIconUrl, SITE_COLORS } from "../utils/map-style";
import type { SiteFilter } from "./KmzMapLayers";

const COLLAPSED_KEY = "fiber-stats-collapsed";

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Headline numbers over the map; collapsible. The site chips double as
 * filters, and the unmatched one lists the localities (exports live in the
 * Info drawer).
 */
export default function StatsBar(props: {
  items: FiberInventoryItemT[];
  sites: FiberSiteT[];
  siteFilter: SiteFilter;
  onSiteFilter: (f: SiteFilter) => void;
}) {
  const { items, sites, siteFilter } = props;
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const setCollapsedSaved = (c: boolean) => {
    setCollapsed(c);
    try {
      localStorage.setItem(COLLAPSED_KEY, c ? "1" : "0");
    } catch {
      // private mode etc.: just don't remember it
    }
  };

  const stats = useMemo(() => {
    const km =
      items
        .filter((i) => i.kind === "line")
        .reduce((s, i) => s + lineLengthM(i.geom), 0) / 1000;
    const manholes = items.filter(isManhole);
    const existing = manholes.filter(
      (m) => manholeStatusKey(m) === "existing",
    ).length;
    const unmatched = sites.filter((s) => !s.matchedFeature);
    const byLocality = new Map<string, number>();
    for (const s of unmatched) {
      byLocality.set(s.locality, (byLocality.get(s.locality) ?? 0) + 1);
    }
    return {
      km,
      manholes: manholes.length,
      existing,
      matched: sites.length - unmatched.length,
      unmatched,
      byLocality: [...byLocality].sort((a, b) => b[1] - a[1]),
    };
  }, [items, sites]);

  const pct = sites.length
    ? Math.round((stats.matched / sites.length) * 100)
    : 0;
  const toggle = (f: SiteFilter) =>
    props.onSiteFilter(siteFilter === f ? "all" : f);

  const unmatchedPanel = (
    <div className="flex w-64 flex-col gap-2 text-xs">
      <div className="max-h-56 overflow-y-auto">
        <table className="w-full">
          <tbody>
            {stats.byLocality.map(([locality, n]) => (
              <tr key={locality}>
                <td className="py-0.5 pr-2 truncate max-w-44">{locality}</td>
                <td className="py-0.5 text-right tabular-nums font-medium">
                  {n}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-zinc-200 pt-2 dark:border-zinc-700">
        <Button
          size="small"
          block
          type={siteFilter === "unmatched" ? "primary" : "default"}
          onClick={() => toggle("unmatched")}
        >
          {siteFilter === "unmatched"
            ? "Show all sites"
            : "Show only unmatched sites"}
        </Button>
      </div>
    </div>
  );

  const km = `${stats.km.toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
  const shell =
    "pointer-events-auto rounded-xl border border-zinc-200 bg-white/95 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95";

  if (collapsed) {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-3">
        <button
          type="button"
          onClick={() => setCollapsedSaved(false)}
          className={`${shell} flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs font-medium hover:bg-white dark:hover:bg-zinc-900`}
          aria-expanded={false}
          title="Show network stats"
        >
          <NodeIndexOutlined style={{ color: "#22c55e" }} />
          {km}
          {siteFilter !== "all" && (
            <span className="rounded-full bg-zinc-900 px-1.5 text-[10px] text-white dark:bg-zinc-100 dark:text-zinc-900">
              {siteFilter} sites
            </span>
          )}
          <DownOutlined className="text-[10px] opacity-60" />
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-3">
      <div className={`${shell} flex flex-wrap items-stretch gap-1.5 p-1.5`}>
        <Chip
          icon={<NodeIndexOutlined style={{ color: "#22c55e" }} />}
          value={km}
          label="fiber routes"
        />
        {stats.manholes > 0 && (
          <Chip
            icon={
              <img
                src={manholeIconUrl(MANHOLE_COLORS.existing)}
                width={14}
                height={14}
                alt=""
              />
            }
            value={stats.manholes.toLocaleString()}
            label={`manholes · ${stats.existing} existing`}
          />
        )}
        {sites.length > 0 && (
          <Chip
            icon={<EnvironmentFilled style={{ color: SITE_COLORS.matched }} />}
            value={`${pct}%`}
            label={`${stats.matched}/${sites.length} sites matched`}
            active={siteFilter === "matched"}
            onClick={() => toggle("matched")}
            title="Show only matched sites"
          />
        )}
        {stats.unmatched.length > 0 && (
          <Popover
            content={unmatchedPanel}
            title="Unmatched sites by locality"
            trigger="click"
            placement="bottom"
          >
            {/* popovers need a DOM child to anchor to */}
            <span className="flex">
              <Chip
                icon={
                  <EnvironmentFilled style={{ color: SITE_COLORS.unmatched }} />
                }
                value={stats.unmatched.length.toLocaleString()}
                label="unmatched sites"
                active={siteFilter === "unmatched"}
                title="By locality, and filter"
              />
            </span>
          </Popover>
        )}
        <Tooltip title="Collapse">
          <button
            type="button"
            onClick={() => setCollapsedSaved(true)}
            aria-expanded
            aria-label="Collapse network stats"
            className="flex cursor-pointer items-center rounded-lg px-1.5 opacity-60 transition-opacity hover:bg-zinc-100 hover:opacity-100 dark:hover:bg-zinc-800"
          >
            <UpOutlined className="text-[11px]" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

function Chip(props: {
  icon: ReactNode;
  value: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  const clickable = !!props.onClick || props.title;
  return (
    <button
      type="button"
      onClick={props.onClick}
      title={props.title}
      className={`flex items-center gap-2 rounded-lg px-2.5 py-1 text-left transition-colors ${
        clickable
          ? "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
          : "cursor-default"
      } ${props.active ? "bg-zinc-900! text-white dark:bg-zinc-100! dark:text-zinc-900" : ""}`}
    >
      <span className="flex text-base">{props.icon}</span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold tabular-nums">
          {props.value}
        </span>
        <span className="text-[10px] opacity-70">{props.label}</span>
      </span>
    </button>
  );
}
