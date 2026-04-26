import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_user/ftth-projects")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_user/ftth-projects"!</div>;
}
