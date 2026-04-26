import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import "../styles.css";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => (
    <div>
      <p>Page not found</p>
      <p>
        <Link to="/">Go home</Link>
      </p>
    </div>
  ),
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackDevtools
        config={{ position: "bottom-right" }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}
