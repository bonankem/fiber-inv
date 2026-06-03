import { createFileRoute } from "@tanstack/react-router";
import FhcPage from "#/modules/ftth-connections/FhcPage";

export const Route = createFileRoute("/_user/ftth-connections")({
  component: FhcPage,
});
