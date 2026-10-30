import { createFileRoute } from "@tanstack/react-router";
import { EmrfPage } from "#/modules/inventory/InventoryPages";

export const Route = createFileRoute("/_user/emrf")({
  component: EmrfPage,
});