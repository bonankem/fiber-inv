import { text } from "node:stream/consumers";
import type { InputJsonValue } from "@prisma/client/runtime/client";
import { fromBuffer } from "yauzl-promise";

export type ParserInput = {
  data: Buffer;
  name: string;
  type: string;
};

type Result = InputJsonValue;

export type ParserFunc<T extends Result = Result> = (
  p: ParserInput,
) => Promise<T | null>;

export function isZip(b: Buffer) {
  return b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04;
}

export async function maybeUnzip(data: Buffer) {
  if (isZip(data)) {
    const zip = await fromBuffer(data);
    const kml = await zip.readEntry();
    return kml && text(await zip.openReadStream(kml));
  }
  return data.toString("utf-8");
}
