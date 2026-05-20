import type { Maybe } from "schema/utils";

const shortNameLimit = 20;
export function shortName(who: Maybe<string | { name: string }>) {
  const name = typeof who === "string" ? who : who?.name;
  if (!name) return undefined;
  if (name.length <= shortNameLimit) return name;

  // initialize all but the first and last name
  const shorter = name.replace(/ \S*?(\p{L})\S* /gu, " $1. ");
  if (shorter.length <= shortNameLimit) return shorter;

  // initialize all but the first name
  return name.replace(/^(\S+).*?(\p{L})\S*$/u, "$1 $2.");
}
