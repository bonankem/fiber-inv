/** Colours and symbols shared by the inventory map and its legend. */

export const ZONE_COLOR = "#ffcb05";
export const ROUTE_COLOR = "#22c55e";
export const POINT_COLOR = "#ffcb05";
export const SITE_COLORS = {
  matched: "#16a34a",
  unmatched: "#ea580c",
} as const;

/** Site pin: a diamond centred on the site, in Symbol path units */
export const DIAMOND_PATH = "M 0 -1.35 L 1 0 L 0 1.35 L -1 0 Z";

/** Other KMZ points (POPs, closures, ...): a unit circle in Symbol path units */
export const CIRCLE_PATH = "M -1 0 A 1 1 0 1 0 1 0 A 1 1 0 1 0 -1 0 Z";

/** Manhole cover: status-coloured disc, white rim, inner ring and cross */
export function manholeIconUrl(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11.5" fill="#000" fill-opacity="0.3"/><circle cx="12" cy="12" r="9.5" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="12" cy="12" r="5.4" fill="none" stroke="#fff" stroke-opacity="0.9" stroke-width="1.3"/><path d="M8.7 12h6.6M12 8.7v6.6" stroke="#fff" stroke-opacity="0.9" stroke-width="1.3" stroke-linecap="round"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
