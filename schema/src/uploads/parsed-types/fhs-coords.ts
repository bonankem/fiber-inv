import z from "zod";
import { coordsZ } from "#/geo";
import { BoxType, WorkDocType } from "#/prisma";
import { zObject, zStr } from "#/utils";

export const upFhsBoxZ = z.object({
  name: zStr("The name of this element"),
  type: z.enum(BoxType).nullable(),
  coords: coordsZ.nullable().describe("The coordinates of this element"),
  hp: z.int().optional().nullable().describe("HP of this element"),
});

export type UpFhsBoxT = z.infer<typeof upFhsBoxZ>;

export const upFhsCoordsZ = zObject("UpFhsCoordsT", {
  type: z.literal(WorkDocType.COORDINATES),
  boxes: z.array(upFhsBoxZ),
});

export type UpFhsCoordsT = z.infer<typeof upFhsCoordsZ>;
