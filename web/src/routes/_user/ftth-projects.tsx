import { createFileRoute } from "@tanstack/react-router";
import FhpPage from "#/modules/ftth-projects/FhpPage";

export const Route = createFileRoute("/_user/ftth-projects")({
  component: FhpPage,
});
