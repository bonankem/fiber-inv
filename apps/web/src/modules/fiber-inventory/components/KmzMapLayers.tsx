import { InfoWindow, Marker, useMap } from "@vis.gl/react-google-maps";
import { Tag } from "antd";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  FIBER_MATCH_RADIUS_M,
  type FiberInventoryItemT,
  type FiberSiteT,
  type FiberSourceT,
  featureLabel,
  lineLengthM,
} from "schema/fiber-inventory";
import { centerOf, computeBounds, describeMatch } from "../utils/geo-preview";
import {
  isManhole,
  MANHOLE_LABEL_ZOOM,
  MANHOLE_MIN_ZOOM,
  manholeColor,
  manholeStatusKey,
  manholeStatusLabel,
} from "../utils/manholes";
import { clearMapFocus, useMapFocus } from "../utils/map-focus";
import {
  CIRCLE_PATH,
  DIAMOND_PATH,
  manholeIconUrl,
  POINT_COLOR,
  ROUTE_COLOR,
  SITE_COLORS,
  ZONE_COLOR,
} from "../utils/map-style";
import { clusterSites } from "../utils/site-clusters";
import type { SelectedMapItem } from "../utils/types";

/** Zoom used when jumping to a site (never zooms out) */
const SITE_FOCUS_ZOOM = 16;

/** Zoom used when jumping to a feature: close enough to see manhole labels */
const FEATURE_FOCUS_ZOOM = MANHOLE_LABEL_ZOOM + 1;

/** Toggleable map layers; the legend uses the same keys */
export type MapLayerKey =
  | "zone"
  | "route"
  | "point"
  | "manhole-existing"
  | "manhole-new"
  | "manhole-unknown"
  | "site-ok"
  | "site-no";

export type SiteFilter = "all" | "matched" | "unmatched";

export function featureLayerKey(item: FiberInventoryItemT): MapLayerKey {
  if (item.kind === "polygon") return "zone";
  if (item.kind === "line") return "route";
  if (isManhole(item)) return `manhole-${manholeStatusKey(item)}`;
  return "point";
}

export function siteLayerKey(site: FiberSiteT): MapLayerKey {
  return site.matchedFeature ? "site-ok" : "site-no";
}

interface KmzMapLayersProps {
  items: FiberInventoryItemT[];
  sites?: FiberSiteT[];
  /** Always group below this zoom; dense data also groups at closer zooms. */
  clusterBelowZoom?: number;
  /** Fly to sites/manholes picked in the Info drawer */
  followSiteFocus?: boolean;
  hidden?: Set<string>;
  siteFilter?: SiteFilter;
  /** Sources, to show each feature's file and job in its popup */
  sources?: FiberSourceT[];
}

export default function KmzMapLayers({
  items,
  sites = [],
  clusterBelowZoom,
  followSiteFocus,
  hidden,
  siteFilter = "all",
  sources = [],
}: KmzMapLayersProps) {
  const map = useMap();
  const [selected, setSelected] = useState<SelectedMapItem | null>(null);
  const selectedFeature = selected?.kind === "feature" ? selected.item : null;
  const [zoom, setZoom] = useState<number>(() => map?.getZoom() ?? 10);
  const [viewport, setViewport] = useState<google.maps.LatLngBounds | null>(
    null,
  );
  const focus = useMapFocus();

  const sourceById = useMemo(
    () => new Map(sources.map((s) => [s.id, s])),
    [sources],
  );
  const isHidden = (key: MapLayerKey) => !!hidden?.has(key);

  const flyTo = (target: google.maps.LatLngLiteral, minZoom: number) => {
    if (!map) return;
    map.panTo(target);
    map.setZoom(Math.max(map.getZoom() ?? 0, minZoom));
  };

  const goToSite = (site: FiberSiteT) => {
    flyTo({ lat: site.lat, lng: site.lng }, SITE_FOCUS_ZOOM);
    setSelected({ kind: "site", site });
  };

  const goToFeature = (item: FiberInventoryItemT) => {
    flyTo(centerOf(item.geom), FEATURE_FOCUS_ZOOM);
    setSelected({ kind: "feature", item });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: only react to new focus requests
  useEffect(() => {
    if (!followSiteFocus || !focus || !map) return;
    const { target } = focus;
    if (target.kind === "site") goToSite(target.site);
    else goToFeature(target.item);
    clearMapFocus();
  }, [focus, map, followSiteFocus]);

  useEffect(() => {
    if (!map) return;
    const update = () => {
      setZoom(map.getZoom() ?? 10);
      setViewport(map.getBounds() ?? null);
    };
    update();
    // Wait until navigation settles instead of rebuilding markers each zoom frame.
    const listener = map.addListener("idle", update);
    return () => listener.remove();
  }, [map]);

  // frame the data once, not on every refresh, so toggling a source or
  // layer doesn't throw the user's view away
  const framed = useRef(false);
  useEffect(() => {
    if (!map || framed.current) return;
    const bounds = computeBounds(items, sites);
    if (!bounds || bounds.isEmpty()) return;
    map.fitBounds(bounds, 32);
    framed.current = true;
  }, [items, sites, map]);

  // ---- zones, routes and network points: one Data layer ----------------------
  // thousands of features (CAD exports) as separate map components freeze the
  // page; a single Data layer draws them all and is restyled in one call
  const [data, setData] = useState<google.maps.Data | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    if (!map) return;
    const layer = new google.maps.Data({ map });
    const click = layer.addListener(
      "click",
      (e: google.maps.Data.MouseEvent) => {
        const item = itemsRef.current[e.feature.getProperty("i") as number];
        if (item) setSelected({ kind: "feature", item });
      },
    );
    setData(layer);
    return () => {
      click.remove();
      layer.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    if (!data) return;
    data.forEach((f) => data.remove(f));
    let i = 0;
    let frame = 0;
    const addBatch = () => {
      const started = performance.now();
      while (i < items.length && performance.now() - started < 8) {
        const index = i++;
        const item = items[index];
        if (isManhole(item) || !item.geom.length) continue;
        const geometry =
          item.kind === "polygon"
            ? new google.maps.Data.Polygon([item.geom])
            : item.kind === "line"
              ? new google.maps.Data.LineString(item.geom)
              : new google.maps.Data.Point(item.geom[0]);
        data.add({ geometry, properties: { i: index } });
      }
      if (i < items.length) frame = requestAnimationFrame(addBatch);
    };
    frame = requestAnimationFrame(addBatch);
    return () => cancelAnimationFrame(frame);
  }, [data, items]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: helpers read the listed state
  useEffect(() => {
    if (!data) return;
    data.setStyle((f) => {
      const item = items[f.getProperty("i") as number];
      if (!item) return { visible: false };
      const active = selectedFeature === item;
      const base = {
        visible: !isHidden(featureLayerKey(item)),
        title: featureLabel(item),
        clickable: true,
      };
      if (item.kind === "polygon") {
        return {
          ...base,
          strokeColor: ZONE_COLOR,
          strokeOpacity: 0.9,
          strokeWeight: active ? 3 : 2,
          fillColor: ZONE_COLOR,
          fillOpacity: active ? 0.22 : 0.12,
          zIndex: 0,
        };
      }
      if (item.kind === "line") {
        return {
          ...base,
          strokeColor: ROUTE_COLOR,
          strokeOpacity: 0.95,
          strokeWeight: active ? 5 : 3,
          zIndex: active ? 3 : 1,
        };
      }
      return {
        ...base,
        zIndex: active ? 4 : 2,
        icon: {
          path: CIRCLE_PATH,
          scale: active ? 6 : 4.5,
          fillColor: POINT_COLOR,
          fillOpacity: 1,
          strokeColor: "#18181b",
          strokeOpacity: 0.85,
          strokeWeight: 1.5,
        },
      };
    });
  }, [data, items, hidden, selectedFeature]);

  // ---- marker helpers ---------------------------------------------------------

  // biome-ignore lint/correctness/useExhaustiveDependencies: recompute once the Maps API has loaded
  const point = useMemo(() => {
    const Point = window.google?.maps?.Point;
    return (x: number, y: number) =>
      Point ? new Point(x, y) : ({ x, y } as google.maps.Point);
  }, [map]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: recompute once the Maps API has loaded
  const size = useMemo(() => {
    const Size = window.google?.maps?.Size;
    return (px: number) =>
      Size ? new Size(px, px) : ({ width: px, height: px } as google.maps.Size);
  }, [map]);

  const manholeIcon = (item: FiberInventoryItemT, active: boolean) => {
    const px = active ? 28 : 22;
    return {
      url: manholeIconUrl(manholeColor(item)),
      scaledSize: size(px),
      anchor: point(px / 2, px / 2),
      // label sits under the cover
      labelOrigin: point(px / 2, px + 8),
    };
  };

  const isSelectedFeature = (item: FiberInventoryItemT) =>
    selected?.kind === "feature" && selected.item === item;
  const isSelectedSite = (site: FiberSiteT) =>
    selected?.kind === "site" && selected.site === site;

  // ---- sites: filtered, then clustered when zoomed out ---------------------------

  const shownSites = useMemo(
    () =>
      sites.filter((s) => {
        if (hidden?.has(siteLayerKey(s))) return false;
        if (siteFilter === "matched") return !!s.matchedFeature;
        if (siteFilter === "unmatched") return !s.matchedFeature;
        return true;
      }),
    [sites, hidden, siteFilter],
  );

  const visibleSites = useMemo(
    () =>
      viewport ? shownSites.filter((site) => viewport.contains(site)) : [],
    [shownSites, viewport],
  );
  const clustering =
    shownSites.length > 200 ||
    (clusterBelowZoom !== undefined && zoom < clusterBelowZoom);
  const groups = useMemo(
    () => (clustering ? clusterSites(visibleSites, zoom) : null),
    [clustering, visibleSites, zoom],
  );

  const showLabels = zoom >= 13;
  const manholes = items.filter(
    (i) =>
      isManhole(i) &&
      !isHidden(featureLayerKey(i)) &&
      viewport?.contains(i.geom[0]),
  );

  const siteMarker = (site: FiberSiteT) => {
    const isMatched = Boolean(site.matchedFeature);
    const displayName = site.siteName || site.code;
    const color = isMatched ? SITE_COLORS.matched : SITE_COLORS.unmatched;
    const active = isSelectedSite(site);
    return (
      <Marker
        key={`${site.code}-${site.lat}-${site.lng}`}
        position={{ lat: site.lat, lng: site.lng }}
        title={`${site.code} - ${displayName}`}
        zIndex={active ? 6 : 4}
        label={
          showLabels
            ? {
                text: displayName,
                className: `site-marker-label ${isMatched ? "matched" : "unmatched"}`,
                color,
                fontSize: "11px",
                fontWeight: "600",
              }
            : undefined
        }
        icon={{
          path: DIAMOND_PATH,
          scale: active ? 10 : 8,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          // label sits under the diamond (Symbol path units)
          labelOrigin: point(0, 2.7),
        }}
        onClick={() => goToSite(site)}
      />
    );
  };

  return (
    <>
      {zoom >= MANHOLE_MIN_ZOOM &&
        manholes.map((item) => {
          const active = isSelectedFeature(item);
          return (
            <Marker
              key={`mh-${item.sourceId}-${item.name}-${item.geom[0].lat}-${item.geom[0].lng}`}
              position={item.geom[0]}
              title={`${featureLabel(item)} · ${manholeStatusLabel(item)}`}
              zIndex={active ? 5 : 3}
              icon={manholeIcon(item, active)}
              label={
                zoom >= MANHOLE_LABEL_ZOOM
                  ? {
                      text: featureLabel(item),
                      color: manholeColor(item),
                      fontSize: "10px",
                      fontWeight: "600",
                      className: "site-marker-label",
                    }
                  : undefined
              }
              onClick={() => setSelected({ kind: "feature", item })}
            />
          );
        })}

      {groups
        ? groups.map((g) =>
            g.sites.length === 1 ? (
              siteMarker(g.sites[0])
            ) : (
              <Marker
                key={`cluster-${g.key}`}
                position={g.center}
                title={`${g.sites.length} sites (${g.matched} matched) - click to zoom in`}
                zIndex={5}
                icon={{
                  path: CIRCLE_PATH,
                  scale: Math.min(26, 11 + Math.log2(g.sites.length) * 3),
                  fillColor:
                    g.matched >= g.sites.length / 2
                      ? SITE_COLORS.matched
                      : SITE_COLORS.unmatched,
                  fillOpacity: 0.92,
                  strokeColor: "#ffffff",
                  strokeWeight: 2.5,
                }}
                label={{
                  text: String(g.sites.length),
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: "700",
                }}
                onClick={() => {
                  map?.panTo(g.center);
                  map?.setZoom(Math.min(zoom + 2, map?.get("maxZoom") ?? 21));
                }}
              />
            ),
          )
        : visibleSites.map(siteMarker)}

      {selected?.kind === "site" && (
        <InfoWindow
          position={{ lat: selected.site.lat, lng: selected.site.lng }}
          pixelOffset={[0, -14]}
          onCloseClick={() => setSelected(null)}
          headerContent={
            <div className="font-semibold text-sm text-zinc-900 pt-1 truncate">
              {selected.site.siteName}
            </div>
          }
        >
          {/* InfoWindows are always white, so don't inherit dark-theme text */}
          <div className="min-w-52 max-w-72 flex flex-col gap-1.5 p-1 pt-0 text-xs text-zinc-900">
            <Row label="Site Code">
              <span className="font-mono font-medium">
                {selected.site.code}
              </span>
            </Row>
            <Row label="Locality">{selected.site.locality}</Row>
            <Row label="Coordinates">
              <span className="font-mono text-[11px]">
                {selected.site.lat.toFixed(5)}, {selected.site.lng.toFixed(5)}
              </span>
            </Row>
            {selected.site.sourceId && (
              <Row label="Source">
                <span className="truncate">
                  {sourceById.get(selected.site.sourceId)?.name}
                </span>
              </Row>
            )}
            <div className="mt-1 pt-1 border-t flex items-center justify-between gap-1">
              <span className="text-zinc-500">Status:</span>
              {selected.site.matchedFeature ? (
                <Tag color="success" className="m-0 text-[10px]">
                  {describeMatch(selected.site)}
                </Tag>
              ) : (
                <Tag color="warning" className="m-0 text-[10px]">
                  No network within {FIBER_MATCH_RADIUS_M} m
                </Tag>
              )}
            </div>
            {!selected.site.matchedFeature && selected.site.nearestFeature && (
              <Row label="Nearest">
                <span className="truncate">
                  {selected.site.nearestFeature} ·{" "}
                  {formatDistance(selected.site.nearestDistance ?? 0)}
                </span>
              </Row>
            )}
          </div>
        </InfoWindow>
      )}

      {selected?.kind === "feature" && (
        <InfoWindow
          position={
            selected.item.kind === "point"
              ? selected.item.geom[0]
              : centerOf(selected.item.geom)
          }
          pixelOffset={selected.item.kind === "point" ? [0, -13] : undefined}
          onCloseClick={() => setSelected(null)}
          headerContent={
            <div className="font-semibold text-sm text-zinc-900 pt-1 flex items-center gap-2 min-w-0">
              <span className="truncate">{featureLabel(selected.item)}</span>
              {isManhole(selected.item) ? (
                <Tag color="purple" className="m-0 text-[10px] shrink-0">
                  Manhole
                </Tag>
              ) : (
                <Tag
                  color="gold"
                  className="m-0 text-[10px] capitalize shrink-0"
                >
                  {selected.item.kind === "line" ? "route" : selected.item.kind}
                </Tag>
              )}
            </div>
          }
        >
          <FeatureDetails
            item={selected.item}
            source={
              selected.item.sourceId
                ? sourceById.get(selected.item.sourceId)
                : undefined
            }
          />
        </InfoWindow>
      )}
    </>
  );
}

function Row(props: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 min-w-0">
      <span className="text-zinc-500 shrink-0">{props.label}:</span>
      <span className="min-w-0 text-right truncate">{props.children}</span>
    </div>
  );
}

export function formatDistance(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

function FeatureDetails(props: {
  item: FiberInventoryItemT;
  source?: FiberSourceT;
}) {
  const { item, source } = props;
  const attrs = Object.entries(item.props ?? {}).slice(0, 10);

  return (
    <div className="min-w-60 max-w-80 flex flex-col gap-1.5 p-1 pt-0 text-xs text-zinc-900">
      {isManhole(item) && (
        <Row label="Status">
          <span className="font-medium" style={{ color: manholeColor(item) }}>
            {manholeStatusLabel(item)}
          </span>
        </Row>
      )}
      {item.kind === "line" && (
        <Row label="Length">{formatDistance(lineLengthM(item.geom))}</Row>
      )}
      {item.kind === "point" && (
        <Row label="Coordinates">
          <span className="font-mono text-[11px]">
            {item.geom[0].lat.toFixed(5)}, {item.geom[0].lng.toFixed(5)}
          </span>
        </Row>
      )}
      {item.layer && <Row label="Layer">{item.layer}</Row>}
      {source && <Row label="Source">{source.name}</Row>}

      {attrs.length > 0 && (
        <div className="mt-1 pt-1 border-t flex flex-col gap-1">
          {attrs.map(([k, v]) => (
            <Row key={k} label={k}>
              <span title={v}>{v}</span>
            </Row>
          ))}
        </div>
      )}

      {!isManhole(item) && (
        <div className="mt-1 pt-1 border-t flex flex-col gap-1">
          <Row label="Matched sites">
            <span className="font-semibold text-green-700">
              {item.sites.length}
            </span>
          </Row>
          {item.sites.length > 0 && (
            <div className="max-h-28 overflow-y-auto flex flex-col gap-1">
              {item.sites.slice(0, 10).map((site) => (
                <div
                  key={`${site.code}-${site.lat}-${site.lng}`}
                  className="flex items-center justify-between gap-2 text-[11px] bg-zinc-50 px-1.5 py-0.5 rounded"
                >
                  <span className="font-mono font-medium">{site.code}</span>
                  <span className="text-zinc-600 truncate max-w-40">
                    {site.siteName}
                  </span>
                </div>
              ))}
              {item.sites.length > 10 && (
                <span className="text-[10px] text-zinc-400 text-center">
                  +{item.sites.length - 10} more sites
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
