import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_user/ftth-connections")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_user/ftth-connections"!</div>;
}
