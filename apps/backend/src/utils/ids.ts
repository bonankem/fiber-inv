import type { Maybe } from "schema/utils";
import { uuidv7 } from "uuidv7";

export const UUID_RE =
  /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

export function newUuid() {
  return uuidv7();
}

export type HasId = string | { id: string };

export function idOf(i: HasId) {
  return typeof i === "string" ? i : i.id;
}
export function connectId(i: HasId) {
  return { connect: { id: idOf(i) } };
}

export function maybeConnect(i: Maybe<HasId>) {
  return i ? connectId(i) : undefined;
}

export function connectIdOrKey(i: string) {
  return { connect: UUID_RE.test(i) ? { id: i } : { key: i } };
}

export function maybeIdOrKey(i: Maybe<string>) {
  return i ? connectIdOrKey(i) : undefined;
}
