import z from "zod";

export enum Subset {
  TOTAL = "TOTAL",
  MY_PENDING = "MY_PENDING",
  OPEN = "OPEN",
  STOPPED = "STOPPED",
  CLOSED = "CLOSED",
}

export type SubsetCounts = Record<Subset, number>;

export const subsetCountsZ = z.record(z.enum(Subset), z.int());
