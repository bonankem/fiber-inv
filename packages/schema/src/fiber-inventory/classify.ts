/**
 * Shared KMZ feature classifier, used by both the upload preview (web) and the
 * inventory API (backend), so a feature is drawn the same way before and after
 * it is saved.
 *
 * Manholes (chambres) are recognised from the KMZ folder they sit in, or from
 * their own name, e.g. "Manholes - Existing / SAN PEDRO CHAMBRE ANSUT".
 */

export type FiberFeatureCategory = "manhole" | "other";
export type FiberManholeStatus = "existing" | "new";

export type FiberFeatureClass = {
  category: FiberFeatureCategory;
  /** Only set for manholes; null when the KMZ doesn't say */
  status: FiberManholeStatus | null;
};

const MANHOLE_RE = /\b(manholes?|chambres?|regards?|L3T\d*)\b/i;
const EXISTING_RE = /\b(exist\w*)\b/i;
const NEW_RE = /\b(new|nouveau|nouvelle|cr[ée]{2}e?|construit\w*|built)\b/i;

export function classifyKmzFeature(f: {
  name: string;
  kind: "polygon" | "line" | "point";
  path?: string[];
}): FiberFeatureClass {
  const path = f.path ?? [];
  const inManholeFolder = path.some((p) => MANHOLE_RE.test(p));
  // by name alone it must also carry an ID ("CH-01", "L3T02"): CAD legends
  // have plain "Chambre existante" / "Chambre construite" text points
  const namedManhole = MANHOLE_RE.test(f.name) && /\d/.test(f.name);
  const isManhole = f.kind === "point" && (inManholeFolder || namedManhole);
  if (!isManhole) return { category: "other", status: null };

  // the folder wins over the name, since names like "exist-04" are codes
  const text = [...path].reverse().join(" / ");
  const status = EXISTING_RE.test(text)
    ? "existing"
    : NEW_RE.test(text)
      ? "new"
      : EXISTING_RE.test(f.name)
        ? "existing"
        : NEW_RE.test(f.name)
          ? "new"
          : null;
  return { category: "manhole", status };
}
