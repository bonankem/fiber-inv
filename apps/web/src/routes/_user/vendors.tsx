import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_user/vendors")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_user/vendors"!</div>;
}
