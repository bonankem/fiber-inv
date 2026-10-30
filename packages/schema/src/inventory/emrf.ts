import { emrfItemS } from "../material";
import type { Prisma } from "../db";
import { emrfLogS } from "./emrf-logs";




/** A closed HP Planning job that materials can be requested for. */
export const emrfJobS = {
  id: true,
  area: true,
  work: {
    select: {
      sid: true,
      name: true,
      vendor: { select: { id: true, name: true } },
    },
  },
  _count: { select: { bom: true, emrfs: true } },
} satisfies Prisma.FtthSurveySelect;

export type EmrfJobT = Prisma.FtthSurveyGetPayload<{
  select: typeof emrfJobS;
}>;

export const emrfS = {
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  orderNumber: true,
  approvedAt: true,
  approvedBy: {
    select: { id: true, name: true, staffRole: true },
  },
  collectedAt: true,
  collectedBy: {
    select: { id: true, name: true },
  },
  collectionComment: true,
  survey: {
    select: {
      id: true,
      area: true,
      work: {
        select: {
          sid: true,
          name: true,
          vendor: { select: { name: true } },
        },
      },
    },
  },
  items: {
    select: emrfItemS,
    orderBy: { position: "asc" },
  },
  logs: {
    select: emrfLogS,
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.EmrfSelect;


/** What the vendor collected for an EMRF, line by line. */

export const emrfCollectionS = {
  id: true,
  status: true,
  orderNumber: true,
  collectedAt: true,
  collectedBy: { select: { id: true, name: true } },
  collectionComment: true,
  items: {
    select: {
      id: true,
      segment: true,
      requestedQty: true,
      collectedQty: true,
      equipment: {
        select: { id: true, name: true, mtnCode: true },
      },
    },
    orderBy: { position: "asc" },
  },
  logs: {
    select: emrfLogS,
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.EmrfSelect;


export type EmrfCollectionT = Prisma.EmrfGetPayload<{
  select: typeof emrfCollectionS;
}>;

export type EmrfItemT = Prisma.EmrfItemGetPayload<{
  select: typeof emrfItemS;
}>;

export type EmrtT = Prisma.EmrfGetPayload<{
  select: typeof emrfS;
}>;
