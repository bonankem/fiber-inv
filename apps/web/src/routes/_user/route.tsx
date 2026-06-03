import { createFileRoute } from "@tanstack/react-router";
import NotFound from "#/components/NotFound";
import UserLayout from "#/layout/UserLayout";

export const Route = createFileRoute("/_user")({
  component: UserLayout,
  notFoundComponent: NotFound,
});
