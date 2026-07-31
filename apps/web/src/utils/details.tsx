import { m } from "i18n/messages";
import type { Maybe } from "schema/utils";

export function metres(m: Maybe<number>) {
  return m ? `${m} m` : null;
}

export function yesNo(b: Maybe<boolean>) {
  return b === null ? null : b ? m.yes() : m.no();
}
