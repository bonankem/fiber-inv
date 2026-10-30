import {
  type EmrfApproveT,
  type EmrfAssignToT,
  type EmrfCollectionT,
  type EmrfCollectT,
  type EmrfCreateT,
  type EmrfJobT,
  type EmrfListT,
  type EmrfCancelT,
  type EmrtT,
  type EquipmentCreateT,
  type EquipmentT,
  type EquipmentUpdateT,
  type equipmentListZ,
  equipmentZ,
  type stockAdjustZ,
} from "schema/inventory";
import { z } from "schema/utils";
import { useApiGet, useApiPost } from "#/api/helpers";

export type EquipmentRecord = EquipmentT;
export type EquipmentCreate = EquipmentCreateT;

const equipmentListR = z.object({
  items: z.array(equipmentZ),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

type EquipmentListR = z.infer<typeof equipmentListR>;

// The EMRF API returns Prisma payloads, so trust its shape instead of re-validating.
type EmrfListR = Omit<EquipmentListR, "items"> & {
  items: EmrtT[];
};

const emrfListR = z.custom<EmrfListR>();

/* -------------------------------- Warehouse -------------------------------- */

export function useEquipmentList(query: z.infer<typeof equipmentListZ>) {
  return useApiGet<EquipmentListR, z.infer<typeof equipmentListZ>>(
    ["inventory", "equipment"],
    equipmentListR,
    query,
  );
}

export function useCreateEquipment() {
  return useApiPost<EquipmentCreate, EquipmentRecord>("inventory/equipment");
}

export function useUpdateEquipment() {
  return useApiPost<EquipmentUpdateT, EquipmentRecord>(
    "inventory/equipment/update",
  );
}

export function useAdjustStock() {
  return useApiPost<z.infer<typeof stockAdjustZ>, EquipmentRecord>(
    "inventory/stock/adjust",
  );
}

/* ---------------------------------- EMRF ---------------------------------- */

export function useEmrfList(query: Partial<EmrfListT>) {
  return useApiGet(["inventory", "emrf"], emrfListR, query);
}

/** Approved EMRFs that still need an Oracle TO number. */
export function useEmrfOracleQueue(enabled = true) {
  return useApiGet(
    ["inventory", "emrf", "oracle-queue"],
    z.custom<EmrtT[]>(),
    undefined,
    { enabled },
  );
}

export function useCreateEmrf() {
  return useApiPost<EmrfCreateT, EmrtT>("inventory/emrf");
}

/** One EMRF, starting from a copy already loaded so nothing flickers. */
export function useEmrf(initial: EmrtT) {
  return useApiGet(
    ["inventory", "emrf", "get"],
    z.custom<EmrtT>(),
    { id: initial.id },
    { initialData: initial },
  );
}

/** EMRF counts by status, plus TOTAL, for the summary cards. */
export function useEmrfCounts() {
  return useApiGet(
    ["inventory", "emrf", "count"],
    z.record(z.string(), z.number()),
  );
}

export function useCollectEmrf() {
  return useApiPost<EmrfCollectT, EmrfCollectionT>(
    "inventory/emrf/collect",
  );
}

export function useApproveEmrf() {
  return useApiPost<EmrfApproveT, EmrtT>("inventory/emrf/approve");
}

export function useAssignToEmrf() {
  return useApiPost<EmrfAssignToT, EmrtT>("inventory/emrf/assign-to");
}

/** Reverting cancels the request; the vendor raises a new one if needed. */
// export function useCancelEmrf() {
//   return useApiPost<EmrfRevertT, EmrtT>("inventory/emrf/cancel");
// }

export function useCancelEmrf() {
  return useApiPost<EmrfCancelT, EmrtT>("inventory/emrf/cancel");
}


/** Closed HP Planning jobs the user can request materials for. */
export function useEmrfJobs(enabled = true) {
  return useApiGet(
    ["inventory", "emrf", "jobs"],
    z.custom<EmrfJobT[]>(),
    undefined,
    { enabled },
  );
}