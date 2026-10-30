import type { Prisma } from "../db";

export const emrfLogS = {
  id: true,
  createdAt: true,
  action: true,
  comment: true,
  details: true,
  actor: {
    select: {
      id: true,
      name: true,
      staffRole: true,
    },
  },
  uploads: {
    select: {
      upload: {
        select: {
          id: true,
          name: true,
          type: true,
          size: true,
          sentAt: true,
        },
      },
    },
  },
} satisfies Prisma.EmrfLogSelect;

export type EmrfLogT = Prisma.EmrfLogGetPayload<{
  select: typeof emrfLogS;
}>;