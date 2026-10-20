import { z, zObject, zStr } from "../utils";

export const emrfRequestItemZ = zObject("EmrfRequestItemT", {
  equipmentId: zStr("Equipment ID"),
  requestedQty: z.int().describe("Requested quantity"),
});

export const emrfRequestZ = zObject("EmrfRequestT", {
  items: emrfRequestItemZ.array(),
});

export type EmrfRequestT = z.infer<typeof emrfRequestZ>;
