import { ConfigProvider, Drawer, Layout, Menu, type ThemeConfig } from "antd";
import type { UserMenuData } from "./useUserMenu";

const menuTheme: ThemeConfig = {
  components: {
    Menu: {
      itemSelectedColor: "black",
      itemSelectedBg: "#ffeb55",
      darkItemSelectedBg: "#ffcb05",
      darkItemSelectedColor: "black",
      itemPaddingInline: 0,
      itemBg: "transparent",
    },
  },
};

export function UserMenu({ data }: { data: UserMenuData }) {
  const sider = (
    <ConfigProvider theme={menuTheme}>
      <Layout.Sider
        {...data.siderProps}
        className="border-r border-gray-200 fixed"
      >
        <Menu
          {...data.menuProps}
          className="mt-16!"
          classNames={{ item: "px-4!" }}
        />
      </Layout.Sider>
    </ConfigProvider>
  );

  return data.isDrawer ? (
    <Drawer id="nav-drawer" {...data.drawerProps}>
      {sider}
    </Drawer>
  ) : (
    sider
  );
}
