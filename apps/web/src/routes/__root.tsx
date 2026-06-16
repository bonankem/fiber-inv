import "../styles.css";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import ApiProvider from "#/api/provider";
import NotFound from "#/components/NotFound";
import ThemeProvider from "#/theme";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <>
      <ApiProvider>
        <ThemeProvider>
          <Outlet />
        </ThemeProvider>
      </ApiProvider>

      <TanStackDevtools
        config={{ position: "bottom-left" }}
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
