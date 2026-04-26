import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_user")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h1>User</h1>
      <Outlet />
    </div>
  );
}
