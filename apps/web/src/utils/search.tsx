/** biome-ignore-all lint/suspicious/noArrayIndexKey: not an issue here */
import { Fragment, type ReactNode } from "react";

/**
 * Converts the string to a searchable form.
 * White-space, symbols, punctuation and diacritics are removed,
 * and the string is converted to lower case to improve searching.
 */
export function makeSearchKey(text: string) {
  const norm = text.normalize("NFKD");
  return norm.toLowerCase().replace(/[\W_]+/g, "");
}

export function makeSearchRex(text: string) {
  return makeSearchRexFromKey(makeSearchKey(text));
}

export function makeSearchRexFromKey(key: string) {
  const src = key
    .replace(/(.)/g, `$1[-' ]?`)
    .replace(/a/g, "[aá]")
    .replace(/c/g, "[cç]")
    .replace(/e/g, "[eêéèêë]")
    .replace(/i/g, "[iîï]")
    .replace(/o/g, "[oô]")
    .replace(/u/g, "[uùûü]")
    .replace(/y/g, "[yÿ]");
  return new RegExp(`(${src})`, "gi");
}

export function withSearchHighlights(
  text: string,
  re: RegExp,
  className = "text-red-500",
): ReactNode {
  const parts = text.split(re).map((s, i) => {
    return i % 2 === 0 ? (
      <Fragment key={i}>{s}</Fragment>
    ) : (
      <span key={i} className={className}>
        {s}
      </span>
    );
  });
  return <span>{parts}</span>;
}
