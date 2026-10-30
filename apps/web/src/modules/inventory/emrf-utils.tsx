import dayjs from "dayjs";
import type { EmrtT } from "schema/inventory";

export type EmrfRow = EmrtT;
export type EmrfLine = EmrfRow["items"][number];

/** The random tail of the ID: short enough for a table, unique in practice. */
export function emrfShortId(emrf: EmrfRow) {
  return emrf.id.slice(-8).toUpperCase();
}

export function emrfVendor(emrf: EmrfRow) {
  return emrf.survey?.work.vendor?.name;
}

export function emrfJobName(emrf: EmrfRow) {
  const work = emrf.survey?.work;
  return work ? `${work.sid} · ${work.name}` : undefined;
}

export function emrfSegments(emrf: EmrfRow) {
  return [...new Set(emrf.items.map((item) => item.segment))].join(", ");
}

export function emrfTotal(emrf: EmrfRow) {
  return emrf.items.reduce((sum, item) => sum + item.requestedQty, 0);
}

export function emrfCollected(emrf: EmrfRow) {
  return emrf.items.reduce((sum, item) => sum + item.collectedQty, 0);
}

/** How much of the line is still to be collected. */
export function lineOutstanding(line: EmrfLine) {
  return Math.max(0, line.requestedQty - line.collectedQty);
}

export function lineShortfall(line: EmrfLine) {
  return Math.max(0, lineOutstanding(line) - line.equipment.available);
}

export function emrfShortLines(emrf: EmrfRow) {
  return emrf.items.filter((line) => lineShortfall(line) > 0);
}

export const formatDate = (date: Date | string) =>
  dayjs(date).format("D MMM YYYY, HH:mm");
