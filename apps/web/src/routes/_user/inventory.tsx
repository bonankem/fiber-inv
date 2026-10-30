import { createFileRoute } from "@tanstack/react-router";
import { InventoryStockPage } from "#/modules/inventory/InventoryPages";

export const Route = createFileRoute("/_user/inventory")({
  component: InventoryStockPage,
});