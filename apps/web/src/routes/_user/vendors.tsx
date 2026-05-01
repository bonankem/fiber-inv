import { createFileRoute } from "@tanstack/react-router";
import VendorsPage from "#/modules/vendors/VendorsPage";

export const Route = createFileRoute("/_user/vendors")({
  component: VendorsPage,
});
