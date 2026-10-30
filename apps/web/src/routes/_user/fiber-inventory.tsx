import { createFileRoute } from "@tanstack/react-router";
import FiberInventoryPage from "#/modules/fiber-inventory/FiberInventoryPage";

export const Route = createFileRoute("/_user/fiber-inventory")({
  component: FiberInventoryPage,
});
