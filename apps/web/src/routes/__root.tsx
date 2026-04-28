import "../styles.css";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ConfigProvider, type ThemeConfig } from "antd";
import NotFound from "#/components/NotFound";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});

const appTheme: ThemeConfig = {
  token: {
    colorPrimary: "#ffcb05",
    fontFamily: "inherit",
  },
  components: {
    Button: {
      primaryColor: "black",
    },
    Form: {
      itemMarginBottom: 16,
      verticalLabelPadding: "0 0 4px",
    },
  },
};

function RootComponent() {
  return (
    <>
      <ConfigProvider theme={appTheme}>
        <Outlet />
      </ConfigProvider>

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
