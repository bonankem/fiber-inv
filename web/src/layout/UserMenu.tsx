import {
  ConfigProvider,
  Divider,
  Drawer,
  Layout,
  Menu,
  type ThemeConfig,
  theme,
} from "antd";
import MtnLogo from "#/components/MtnLogo";
import UserMenuFooter from "./UserMenuFooter";
import type { UserLayoutProps } from "./useUserLayout";

const menuTheme: ThemeConfig = {
  components: {
    Layout: {
      lightSiderBg: "#ffcb05",
    },
    Menu: {
      itemSelectedColor: "black",
      itemSelectedBg: "#eeb000",
      itemActiveBg: "#eeb000",
      darkItemSelectedBg: "#ffcb05",
      darkItemSelectedColor: "black",
      itemPaddingInline: 0,
      itemBg: "transparent",
      fontSize: 13,
    },
  },
};

export function UserMenu(props: UserLayoutProps) {
  const { token } = theme.useToken();
  const sider = (
    <ConfigProvider theme={menuTheme}>
      <Layout.Sider {...props.sider} className="fixed h-full overflow-hidden">
        <div className="h-full flex flex-col items-stretch">
          <header
            className="h-16 py-2 px-3 flex justify-center"
            style={{ color: token.colorText }}
          >
            <MtnLogo className="py-1 w-auto h-full" />
          </header>

          <Divider className="m-0! p-0!" />

          <Menu
            {...props.menu}
            className="basis-0 grow! shrink! overflow-y-auto"
            classNames={{ item: "px-4!", root: "grow!" }}
          />

          <Divider className="m-0! p-0!" />

          <UserMenuFooter collapsed={props.collapsed} />
        </div>
      </Layout.Sider>
    </ConfigProvider>
  );

  return props.isDrawer ? (
    <Drawer id="nav-drawer" {...props.drawer}>
      {sider}
    </Drawer>
  ) : (
    sider
  );
}
