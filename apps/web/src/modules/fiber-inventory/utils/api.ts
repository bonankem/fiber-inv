import type { FiberInventoryT } from "schema/fiber-inventory";
import { userFullZ } from "schema/people";
import { useApiGet, useApiPost } from "#/api/helpers";

export const useSetSourceVisible = () =>
  useApiPost<{ id: string; visible: boolean }, FiberInventoryT>(
    "fiber-inventory/sources/visible",
  );

export const useSetSourceLayers = () =>
  useApiPost<{ id: string; excludedLayers: string[] }, FiberInventoryT>(
    "fiber-inventory/sources/layers",
  );

export const useDeleteSource = () =>
  useApiPost<{ id: string }, FiberInventoryT>("fiber-inventory/sources/delete");

/** Only staff may change the inventory (the API checks it too) */
export function useCanEditInventory() {
  const user = useApiGet("session/user", userFullZ).data;
  return !!(user?.isAdmin || user?.staffRole);
}
