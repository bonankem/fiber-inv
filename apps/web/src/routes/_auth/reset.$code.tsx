import { createFileRoute } from "@tanstack/react-router";
import ResetPage from "#/modules/auth/ResetPage";

export const Route = createFileRoute("/_auth/reset/$code")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ResetPage {...Route.useParams()} />;
}
