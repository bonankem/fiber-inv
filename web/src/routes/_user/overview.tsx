import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_user/overview")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_user/overview"!</div>;
}
