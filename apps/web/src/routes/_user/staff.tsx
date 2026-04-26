import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_user/staff")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_user/staff"!</div>;
}
