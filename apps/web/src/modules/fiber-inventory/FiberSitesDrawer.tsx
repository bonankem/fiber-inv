import { CopyOutlined, EnvironmentFilled } from "@ant-design/icons";
import { Alert, Drawer, Empty, Input, message, Spin, Tooltip } from "antd";
import { useMemo, useState } from "react";
import { groupBy, sortBy } from "remeda";
import {
  FIBER_MATCH_RADIUS_M,
  type FiberSiteT,
  fiberInventoryZ,
} from "schema/fiber-inventory";
import { useApiGet } from "#/api/helpers";
import type { ModalStateProps } from "#/hooks/useModalViewer";
import { describeMatch } from "./utils/geo-preview";

function coordsText(site: FiberSiteT) {
  return `${site.lat.toFixed(5)}, ${site.lng.toFixed(5)}`;
}

export default function FiberSitesDrawer(props: ModalStateProps) {
  const inventory = useApiGet("fiber-inventory", fiberInventoryZ.nullable());
  const [search, setSearch] = useState("");

  const sites = inventory.data?.sites ?? [];
  const matched = sites.filter((s) => s.matchedFeature).length;

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (inventory.data?.sites ?? []).filter(
      (s) =>
        !q ||
        [s.siteName, s.code, s.locality].some((v) =>
          v.toLowerCase().includes(q),
        ),
    );
    const byLocality = groupBy(list, (s) => s.locality);
    return sortBy(Object.entries(byLocality), ([name]) => name);
  }, [inventory.data, search]);

  const copy = (site: FiberSiteT) => {
    navigator.clipboard.writeText(coordsText(site));
    message.success("Coordinates copied");
  };

  return (
    <Drawer
      title="Sites"
      open={props.state.isOpen}
      onClose={props.state.close}
      size={600}
      styles={{ body: { padding: 24 } }}
    >
      {inventory.isLoading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : inventory.isError ? (
        <Alert type="error" message="Could not load sites." />
      ) : !sites.length ? (
        <Empty description="No sites uploaded yet" />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 rounded-xl bg-gray-900 dark:bg-black px-5 py-4">
            <EnvironmentFilled className="text-2xl text-brand!" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white leading-none">
                {sites.length}
              </span>
              <span className="text-xs text-gray-400">sites uploaded</span>
            </div>
            <div className="grow" />
            <div className="flex flex-col items-end">
              <span className="text-lg font-semibold text-brand leading-none">
                {matched}
              </span>
              <span className="text-xs text-gray-400">matched to network</span>
            </div>
          </div>

          <Input.Search
            allowClear
            placeholder="Search by site, code or locality"
            onChange={(e) => setSearch(e.target.value)}
          />

          {!groups.length && <Empty description="No matching sites" />}

          {groups.map(([locality, list]) => (
            <section key={locality} className="flex flex-col gap-2">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <span className="h-px w-3 bg-brand" />
                {locality}
                <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 font-normal normal-case">
                  {list.length}
                </span>
              </h3>

              <ul className="flex flex-col gap-2">
                {list.map((site) => (
                  <li
                    key={`${site.code}-${site.lat}-${site.lng}`}
                    className="flex items-center gap-4 pl-4! pr-3 py-3 rounded-lg border border-gray-200 dark:border-gray-700 border-l-4! border-l-brand! hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div className="flex flex-col min-w-0 grow">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {site.siteName}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
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
                      </span>
                    </div>

                    <div className="flex items-center shrink-0 rounded-full bg-white dark:bg-gray-900 border border-yellow-300 dark:border-yellow-700">
                      <Tooltip title="View on Google Maps">
                        <a
                          href={`https://www.google.com/maps/place/${site.lat},${site.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pl-3 pr-2 py-1 font-mono text-xs text-yellow-600! dark:text-brand! hover:underline"
                        >
                          {coordsText(site)}
                        </a>
                      </Tooltip>
                      <Tooltip title="Copy coordinates">
                        <button
                          type="button"
                          onClick={() => copy(site)}
                          aria-label={`Copy coordinates for ${site.siteName}`}
                          className="pl-1 pr-3 py-1 text-xs text-yellow-500 hover:text-yellow-600 dark:text-brand/70 dark:hover:text-brand"
                        >
                          <CopyOutlined />
                        </button>
                      </Tooltip>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Drawer>
  );
}
