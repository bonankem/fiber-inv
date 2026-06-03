import type { Maybe } from "schema/utils";

export function shortName(who: Maybe<string | { name: string }>, limit = 20) {
  const name = typeof who === "string" ? who : who?.name;
  if (!name) return undefined;
  if (name.length <= limit) return name;

  // initialize all but the first and last name
  const shorter = name.replace(/ \S*?(\p{L})\S* /gu, " $1. ");
  if (shorter.length <= limit) return shorter;

  // just the first name and the last initial
  return name.replace(/^(\S+).*?(\p{L})\S*$/u, "$1 $2.");
}
