/**
 * Shared KMZ helpers, used by both the upload preview (web) and the inventory
 * API (backend), so a layer has the same name on both sides: the preview sends
 * the layers to leave out by name, and the API applies them.
 */

type FeatureKind = "polygon" | "line" | "point";

/** A placemark as both KML readers produce it, before layers are assigned. */
export type RawKmzFeature = {
  name: string;
  kind: FeatureKind;
  geom: { lat: number; lng: number }[];
  /** Folder/Document names, outermost first */
  path: string[];
  /** Plain-text description (see `cleanDescription`) */
  description: string;
  /** ExtendedData Data / SimpleData name-value pairs */
  data: [string, string][];
};

export type KmzLayerT = { name: string; count: number };

export const NO_FOLDER_LAYER = "(no folder)";

const MAX_PROPS = 15;
const MAX_VALUE = 150;

export function cleanDescription(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<br\s*\/?>|<\/(p|div|tr|li)>/gi, "\n")
    .replace(/<\/t[dh]>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, 500);
}

function isSingleLine(s: string) {
  return !!s && !s.includes("\n") && s.length <= 80;
}

/**
 * CAD exports (e.g. Global Mapper) put every placemark in one folder and
 * write the CAD layer into the description, so many placemarks share a few
 * short descriptions. Only then is the description treated as the layer.
 */
function descriptionsAreLayers(fs: RawKmzFeature[]) {
  if (fs.length < 20) return false;
  const short = fs.filter((f) => isSingleLine(f.description));
  if (short.length < fs.length * 0.8) return false;
  const distinct = new Set(short.map((f) => f.description)).size;
  return distinct <= 60 && distinct <= fs.length * 0.2;
}

/** Leading folders every feature shares (the file's root), to drop from layer names */
function commonPrefixLength(paths: string[][]) {
  if (!paths.length) return 0;
  let n = Math.min(...paths.map((p) => p.length));
  for (let i = 0; i < n; i++) {
    const name = paths[0][i];
    if (paths.some((p) => p[i] !== name)) n = i;
  }
  return n;
}

/** Turns "Lat: 7.2 N\nSource: Plan 3" style descriptions into key/values */
function propsFromDescription(description: string) {
  const lines = description.split("\n");
  const pairs = lines.flatMap((l) => {
    const m = /^([^:]{1,40}):\s*(.+)$/.exec(l);
    return m ? [[m[1].trim(), m[2].trim()] as [string, string]] : [];
  });
  if (pairs.length && pairs.length >= lines.length / 2) return pairs;
  return [["Description", description] as [string, string]];
}

function buildProps(pairs: [string, string][]) {
  const props: Record<string, string> = {};
  for (const [k, v] of pairs) {
    const key = k.trim();
    const value = v.trim();
    if (!key || !value || key in props) continue;
    props[key] = value.slice(0, MAX_VALUE);
    if (Object.keys(props).length >= MAX_PROPS) break;
  }
  return Object.keys(props).length ? props : undefined;
}

/**
 * Gives every feature a `layer` (its folder path below the file's root, plus
 * the CAD layer for CAD exports) and its attributes as `props`.
 */
export function assignLayers<T extends RawKmzFeature>(fs: T[]) {
  const cad = descriptionsAreLayers(fs);
  const skip = commonPrefixLength(fs.map((f) => f.path));
  return fs.map((f) => {
    const parts = f.path.slice(skip);
    if (cad && f.description) parts.push(f.description);
    const descPairs =
      !cad && f.description ? propsFromDescription(f.description) : [];
    return {
      ...f,
      layer: parts.join(" / ") || NO_FOLDER_LAYER,
      props: buildProps(f.data.length ? f.data : descPairs),
    };
  });
}

/** Feature counts per layer, biggest first */
export function countLayers(fs: { layer?: string }[]): KmzLayerT[] {
  const counts = new Map<string, number>();
  for (const f of fs) {
    const name = f.layer ?? NO_FOLDER_LAYER;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/**
 * CAD drawing layers that are never network: hatching, formwork, title block,
 * legend, dimensions, text, road paint... Unticked by default on upload.
 */
const NOISE_RE =
  /\b(hachures?|hatch\w*|coffrage\w*|cartouche|l[ée]gende|legend|cotations?|dimensions?|textes?|text|tabulations?|cadre|frame|titre\w*|title|logo|peinture|marquages?|murs?|niveau|repr|dalle|annotations?|[ée]critures?|page de garde|ref bet|axe de voie|terrain)\b|地形/i;

/** A layer that is only a north arrow, e.g. "NORD" (not "Man Nord" zones) */
const NORTH_ARROW_RE = /(^|\/ )(nord|north)$/i;

export function isNoiseLayer(name: string) {
  return NOISE_RE.test(name) || NORTH_ARROW_RE.test(name.trim());
}
