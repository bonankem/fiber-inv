import type { FhsFilterT } from "schema/fhs";
import type { Prisma } from "#/prisma";
import { qSidIs, qWorkerIs } from "../utils/queries";

type Where = Prisma.FtthSurveyWhereInput;

export function fhsFilter(input: FhsFilterT): Where {
  return {
    work: {
      sid: qSidIs(input.sid),
      status: input.status,
      vendorId: input.vendor,
      requestDate: input.requested,
      workers: qWorkerIs(input.worker),
    },
  };
}
