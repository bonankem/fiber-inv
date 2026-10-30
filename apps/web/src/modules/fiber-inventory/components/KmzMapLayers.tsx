import {
  Circle,
  InfoWindow,
  Marker,
  Polygon,
  Polyline,
  useMap,
} from "@vis.gl/react-google-maps";
import { Tag } from "antd";
import { useEffect, useMemo, useState } from "react";
import {
  FIBER_MATCH_RADIUS_M,
  type FiberInventoryItemT,
  type FiberSiteT,
  featureLabel,
} from "schema/fiber-inventory";
import { centerOf, computeBounds, describeMatch } from "../utils/geo-preview";
import type { SelectedMapItem } from "../utils/types";

interface KmzMapLayersProps {
  items: FiberInventoryItemT[];
  sites?: FiberSiteT[];
  /** Hide site pins below this zoom level (always shown when unset) */
  minPinZoom?: number;
}

export default function KmzMapLayers({
  items,
  sites = [],
  minPinZoom,
}: KmzMapLayersProps) {
  const map = useMap();
  const [selected, setSelected] = useState<SelectedMapItem | null>(null);
  const [zoom, setZoom] = useState<number>(() => map?.getZoom() ?? 10);

  useEffect(() => {
    if (!map) return;
    setZoom(map.getZoom() ?? 10);
    const listener = map.addListener("zoom_changed", () => {
      const z = map.getZoom();
      if (typeof z === "number") {
        setZoom(z);
      }
    });
    return () => {
      listener.remove();
    };
  }, [map]);

  useEffect(() => {
    if (!map || (!items.length && !sites.length)) return;
    const bounds = computeBounds(items, sites);
    if (bounds && !bounds.isEmpty()) {
      map.fitBounds(bounds, 24);
    }
  }, [items, sites, map]);

  const showLabels = zoom >= 13;
  const showPins = minPinZoom === undefined || zoom >= minPinZoom;

  useEffect(() => {
    if (!showPins) setSelected((s) => (s?.kind === "site" ? null : s));
  }, [showPins]);

  const labelOrigin = useMemo(() => {
    if (typeof window !== "undefined" && window.google?.maps?.Point) {
      return new window.google.maps.Point(16, -10);
    }
    return { x: 16, y: -10 } as google.maps.Point;
  }, [map]);

  return (
    <>
      {/* KMZ Features */}
      {items.map((item, index) => {
        const key = `${item.name}-${index}`;
        if (item.kind === "polygon") {
          return (
            <Polygon
              key={key}
              paths={item.geom}
              strokeColor="#ffcb05"
              strokeOpacity={0.9}
              strokeWeight={2}
              fillColor="#ffcb05"
              fillOpacity={0.16}
              onClick={() => setSelected({ kind: "feature", item })}
            />
          );
        }
        if (item.kind === "line") {
          return (
            <Polyline
              key={key}
              path={item.geom}
              strokeColor="#ffcb05"
              strokeOpacity={0.9}
              strokeWeight={3}
              onClick={() => setSelected({ kind: "feature", item })}
            />
          );
        }
        return (
          <Circle
            key={key}
            center={item.geom[0]}
            radius={8}
            strokeColor="#ffcb05"
            fillColor="#ffcb05"
            fillOpacity={1}
            onClick={() => setSelected({ kind: "feature", item })}
          />
        );
      })}

      {/* Real-time Parsed Site Markers */}
      {(showPins ? sites : []).map((site) => {
        const isMatched = Boolean(site.matchedFeature);
        const displayName = site.siteName || site.code;
        return (
          <Marker
            key={`${site.code}-${site.lat}-${site.lng}`}
            position={{ lat: site.lat, lng: site.lng }}
            title={`${site.code} - ${displayName}`}
            label={
              showLabels
                ? {
                    text: displayName,
                    className: `site-marker-label ${isMatched ? "matched" : "unmatched"}`,
                    color: isMatched ? "#15803d" : "#c2410c",
                    fontSize: "11px",
                    fontWeight: "600",
                  }
                : undefined
            }
            icon={{
              url: isMatched
                ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                : "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
              labelOrigin: showLabels ? labelOrigin : undefined,
            }}
            onClick={() => setSelected({ kind: "site", site })}
          />
        );
      })}

      {/* InfoWindow for Site Selection */}
      {selected?.kind === "site" && (
        <InfoWindow
          position={{ lat: selected.site.lat, lng: selected.site.lng }}
          pixelOffset={[0, -28]}
          onCloseClick={() => setSelected(null)}
          headerContent={
            <div className="font-semibold text-sm text-zinc-900 pt-1 truncate">
              {selected.site.siteName}
            </div>
          }
        >
          <div className="min-w-48 max-w-64 flex flex-col gap-1.5 p-1 pt-0 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-500">Site Code:</span>
              <span className="font-mono font-medium">
                {selected.site.code}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-500">Locality:</span>
              <span>{selected.site.locality}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-500">Coordinates:</span>
              <span className="font-mono text-[11px]">
                {selected.site.lat.toFixed(4)}, {selected.site.lng.toFixed(4)}
              </span>
            </div>
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
          </div>
        </InfoWindow>
      )}

      {/* InfoWindow for Network Feature Selection */}
      {selected?.kind === "feature" && (
        <InfoWindow
          position={centerOf(selected.item.geom)}
          onCloseClick={() => setSelected(null)}
          headerContent={
            <div className="font-semibold text-sm text-zinc-900 pt-1 flex items-center gap-2 min-w-0">
              <span className="truncate">{featureLabel(selected.item)}</span>
              <Tag color="gold" className="m-0 text-[10px] capitalize shrink-0">
                {selected.item.kind}
              </Tag>
            </div>
          }
        >
          <div className="min-w-56 max-w-72 flex flex-col gap-1.5 p-1 pt-0 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Matched Sites:</span>
              <span className="font-semibold text-green-700">
                {selected.item.sites.length} site(s)
              </span>
            </div>
            {selected.item.sites.length > 0 && (
              <div className="mt-1 max-h-32 overflow-y-auto flex flex-col gap-1 border-t pt-1">
                {selected.item.sites.slice(0, 10).map((site) => (
                  <div
                    key={site.code}
                    className="flex items-center justify-between text-[11px] bg-zinc-50 px-1.5 py-0.5 rounded"
                  >
                    <span className="font-mono font-medium">{site.code}</span>
                    <span className="text-zinc-600 truncate max-w-36">
                      {site.siteName}
                    </span>
                  </div>
                ))}
                {selected.item.sites.length > 10 && (
                  <span className="text-[10px] text-zinc-400 text-center">
                    +{selected.item.sites.length - 10} more sites
                  </span>
                )}
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}
