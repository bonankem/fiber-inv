import { MenuOutlined } from "@ant-design/icons";
import { Outlet } from "@tanstack/react-router";
import { Layout, theme } from "antd";
import { UserMenu } from "./UserMenu";
import { useUserMenu } from "./useUserMenu";

export default function UserLayout() {
  const { token } = theme.useToken();
  const menu = useUserMenu();

  return (
    <Layout className="w-screen h-screen">
      <UserMenu data={menu} />

      <Layout>
        <Layout.Header
          className="flex items-center gap-3 md:gap-6 px-3! lg:px-4! h-10! md:h-12!"
          style={{ backgroundColor: token.colorBgContainer }}
        >
          <button
            type="button"
            onClick={menu.toggle}
            className="cursor-pointer hover:text-yellow-600 text-sm md:text-base"
          >
            <MenuOutlined />
          </button>

          <h1 className="font-medium md:text-xl">{menu.pageTitle}</h1>
        </Layout.Header>
        <Layout.Content>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
