import { CopyOutlined, EnvironmentFilled } from "@ant-design/icons";
import {
  Alert,
  Drawer,
  Empty,
  Input,
  message,
  Pagination,
  Spin,
  Tabs,
  Tooltip,
} from "antd";
import { useMemo, useState } from "react";
import { groupBy, sortBy } from "remeda";
import {
  FIBER_MATCH_RADIUS_M,
  type FiberInventoryItemT,
  type FiberInventoryT,
  type FiberSiteT,
  featureLabel,
  fiberInventoryZ,
} from "schema/fiber-inventory";
import { useApiGet } from "#/api/helpers";
import type { ModalStateProps } from "#/hooks/useModalViewer";
import SourcesTab from "./components/SourcesTab";
import { describeMatch } from "./utils/geo-preview";
import {
  isManhole,
  MANHOLE_COLORS,
  MANHOLE_STATUS_LABELS,
  type ManholeStatusKey,
  manholeStatusKey,
} from "./utils/manholes";
import { focusFeature, focusSite } from "./utils/map-focus";

type LatLng = { lat: number; lng: number };

function coordsText(p: LatLng) {
  return `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`;
}

function matches(q: string, values: string[]) {
  return !q || values.some((v) => v.toLowerCase().includes(q));
}

/** Sites and manholes of the fiber inventory; picking one flies the map to it. */
export default function FiberInfoDrawer(props: ModalStateProps) {
  const inventory = useApiGet("fiber-inventory", fiberInventoryZ.nullable());
  const sites = inventory.data?.sites ?? [];
  const manholes = (inventory.data?.items ?? []).filter(isManhole);
  const sources = inventory.data?.uploads ?? [];

  // close the drawer so the map is visible, then fly to the entry
  const close = props.state.close;

  return (
    <Drawer
      title="Fiber inventory"
      open={props.state.isOpen}
      onClose={close}
      size={600}
      styles={{
        body: {
          padding: "8px 24px 0",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        },
      }}
    >
      {inventory.isLoading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : inventory.isError ? (
        <Alert type="error" message="Could not load the fiber inventory." />
      ) : (
        <Tabs
          className="[&>.ant-tabs-body-holder]:overflow-y-auto"
          styles={{
            root: {
              flex: "1 1 0",
              minHeight: 0,
              overflow: "hidden",
              flexDirection: "column",
            },
            header: { flexShrink: 0 },
            content: { paddingBottom: 24 },
          }}
          items={[
            {
              key: "sites",
              label: `Sites (${sites.length})`,
              children: (
                <SitesTab
                  data={inventory.data}
                  onPick={(s) => {
                    focusSite(s);
                    close();
                  }}
                />
              ),
            },
            {
              key: "manholes",
              label: `Manholes (${manholes.length})`,
              children: (
                <ManholesTab
                  manholes={manholes}
                  onPick={(m) => {
                    focusFeature(m);
                    close();
                  }}
                />
              ),
            },
            {
              key: "sources",
              label: `Sources (${sources.length})`,
              children: <SourcesTab sources={sources} />,
            },
          ]}
        />
      )}
    </Drawer>
  );
}

function SitesTab(props: {
  data: FiberInventoryT | null | undefined;
  onPick: (site: FiberSiteT) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const sites = props.data?.sites ?? [];
  const matched = sites.filter((s) => s.matchedFeature).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (props.data?.sites ?? []).filter((s) =>
      matches(q, [s.siteName, s.code, s.locality]),
    );
    return sortBy(
      list,
      (s) => s.locality,
      (s) => s.siteName,
    );
  }, [props.data, search]);
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / pageSize)),
  );
  const groups = useMemo(() => {
    const list = filtered.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );
    const byLocality = groupBy(list, (s) => s.locality);
    return sortBy(Object.entries(byLocality), ([name]) => name);
  }, [filtered, currentPage]);

  if (!sites.length) return <Empty description="No sites uploaded yet" />;

  return (
    <div className="flex flex-col gap-5">
      <SummaryCard
        total={sites.length}
        totalLabel="sites uploaded"
        stats={[
          {
            value: matched,
            label: "matched to network",
            color: "var(--color-brand)",
          },
        ]}
      />

      <Input.Search
        allowClear
        placeholder="Search by site, code or locality"
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {!groups.length && <Empty description="No matching sites" />}

      {groups.map(([locality, list]) => (
        <Group key={locality} title={locality} count={list.length}>
          {list.map((site) => (
            <Row
              key={`${site.code}-${site.lat}-${site.lng}`}
              accent="var(--color-brand)"
              coords={site}
              onPick={() => props.onPick(site)}
              title={site.siteName}
              subtitle={
                <>
                  {site.code}
                  {" · "}
                  {site.matchedFeature ? (
                    <span className="text-green-600 dark:text-green-400">
                      {describeMatch(site)}
                    </span>
                  ) : (
                    <span className="text-orange-600 dark:text-orange-400">
                      No network within {FIBER_MATCH_RADIUS_M} m
                    </span>
                  )}
                </>
              }
            />
          ))}
        </Group>
      ))}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filtered.length}
        onChange={setPage}
        showSizeChanger={false}
        hideOnSinglePage
        showTotal={(total) => `${total.toLocaleString()} sites`}
      />
    </div>
  );
}

const STATUS_ORDER: ManholeStatusKey[] = ["existing", "new", "unknown"];

function ManholesTab(props: {
  manholes: FiberInventoryItemT[];
  onPick: (manhole: FiberInventoryItemT) => void;
}) {
  const [search, setSearch] = useState("");
  const { manholes } = props;

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = manholes.filter((m) => matches(q, [featureLabel(m)]));
    const byStatus = groupBy(list, manholeStatusKey);
    return STATUS_ORDER.flatMap((status) => {
      const items = byStatus[status];
      return items?.length
        ? [{ status, items: sortBy(items, (m) => featureLabel(m)) }]
        : [];
    });
  }, [manholes, search]);

  if (!manholes.length) {
    return (
      <Empty
        description={
          <span className="text-xs">
            No manholes yet. Upload a KMZ with points in a folder (or named)
            Manhole, Chambre, Regard or L3T.
          </span>
        }
      />
    );
  }

  const count = (s: ManholeStatusKey) =>
    manholes.filter((m) => manholeStatusKey(m) === s).length;

  return (
    <div className="flex flex-col gap-5">
      <SummaryCard
        total={manholes.length}
        totalLabel="manholes mapped"
        stats={STATUS_ORDER.filter(count).map((s) => ({
          value: count(s),
          label: MANHOLE_STATUS_LABELS[s].toLowerCase(),
          color: MANHOLE_COLORS[s],
        }))}
      />

      <Input.Search
        allowClear
        placeholder="Search by manhole name"
        onChange={(e) => setSearch(e.target.value)}
      />

      {!groups.length && <Empty description="No matching manholes" />}

      {groups.map(({ status, items }) => (
        <Group
          key={status}
          title={MANHOLE_STATUS_LABELS[status]}
          count={items.length}
          color={MANHOLE_COLORS[status]}
        >
          {items.map((m) => (
            <Row
              key={`${featureLabel(m)}-${m.geom[0].lat}-${m.geom[0].lng}`}
              accent={MANHOLE_COLORS[status]}
              coords={m.geom[0]}
              onPick={() => props.onPick(m)}
              title={featureLabel(m)}
              subtitle={MANHOLE_STATUS_LABELS[status]}
            />
          ))}
        </Group>
      ))}
    </div>
  );
}

function SummaryCard(props: {
  total: number;
  totalLabel: string;
  stats: { value: number; label: string; color: string }[];
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-900 dark:bg-black px-5 py-4">
      <EnvironmentFilled className="text-2xl text-brand!" />
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-white leading-none">
          {props.total}
        </span>
        <span className="text-xs text-gray-400">{props.totalLabel}</span>
      </div>
      <div className="grow" />
      {props.stats.map((s) => (
        <div key={s.label} className="flex flex-col items-end">
          <span
            className="text-lg font-semibold leading-none"
            style={{ color: s.color }}
          >
            {s.value}
          </span>
          <span className="text-xs text-gray-400">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function Group(props: {
  title: string;
  count: number;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        <span
          className="h-px w-3 bg-brand"
          style={props.color ? { background: props.color } : undefined}
        />
        {props.title}
        <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 font-normal normal-case">
          {props.count}
        </span>
      </h3>
      <ul className="flex flex-col gap-2">{props.children}</ul>
    </section>
  );
}

function Row(props: {
  title: string;
  subtitle: React.ReactNode;
  coords: LatLng;
  accent: string;
  onPick: () => void;
}) {
  const { coords } = props;
  const copy = () => {
    navigator.clipboard.writeText(coordsText(coords));
    message.success("Coordinates copied");
  };

  return (
    <li
      className="flex items-center gap-4 pl-4! pr-3 py-3 rounded-lg border border-gray-200 dark:border-gray-700 border-l-4! hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      style={{ borderLeftColor: props.accent }}
    >
      <button
        type="button"
        onClick={props.onPick}
        title="Show on map"
        className="flex flex-col min-w-0 grow text-left cursor-pointer"
      >
        <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
          {props.title}
        </span>
        <span className="text-xs text-gray-500 truncate">{props.subtitle}</span>
      </button>

      <div className="flex items-center shrink-0 rounded-full bg-white dark:bg-gray-900 border border-yellow-300 dark:border-yellow-700">
        <Tooltip title="View on Google Maps">
          <a
            href={`https://www.google.com/maps/place/${coords.lat},${coords.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pl-3 pr-2 py-1 font-mono text-xs text-yellow-600! dark:text-brand! hover:underline"
          >
            {coordsText(coords)}
          </a>
        </Tooltip>
        <Tooltip title="Copy coordinates">
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy coordinates for ${props.title}`}
            className="pl-1 pr-3 py-1 text-xs text-yellow-500 hover:text-yellow-600 dark:text-brand/70 dark:hover:text-brand"
          >
            <CopyOutlined />
          </button>
        </Tooltip>
      </div>
    </li>
  );
}
