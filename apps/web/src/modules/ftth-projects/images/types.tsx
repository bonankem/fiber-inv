import type { FhpImageType } from "schema/enums";

export type Entry = {
  uploadId: string;
  type: FhpImageType;
  name: string;
};
