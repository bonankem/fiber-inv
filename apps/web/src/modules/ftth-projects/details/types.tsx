import type { FtthProjectT } from "schema/fhp";
import type { WorkDocT } from "schema/work";

export type FhpTabProps = {
  item: FtthProjectT;
  images: WorkDocT[] | undefined;
};
