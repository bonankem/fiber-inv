import { WorkStatus } from "../db";
import { z } from "../utils";
import { workUpdateDto } from "../work";

export const fhcNextPhases = [
  WorkStatus.INSTALLATION,
  WorkStatus.DESATURATION,
  WorkStatus.BUILDING_CABLING,
];

export const fhcStatusZ = workUpdateDto("FhcStatusT", {
  nextPhase: z.enum(fhcNextPhases),
  comment: z.string(),
});

export type FhcNextPhase = (typeof fhcNextPhases)[number];

export type FhcStatusT = z.infer<typeof fhcStatusZ>;
