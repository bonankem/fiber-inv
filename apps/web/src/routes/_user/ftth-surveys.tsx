import { createFileRoute } from "@tanstack/react-router";
import FhsPage from "#/modules/ftth-surveys/FhsPage";

export const Route = createFileRoute("/_user/ftth-surveys")({
  component: FhsPage,
});
