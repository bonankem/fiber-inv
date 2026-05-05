import {
  FileExcelOutlined,
  MenuOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Layout, theme } from "antd";
import { twJoin } from "tailwind-merge";
import NotificationBell from "./NotificationBell";
import type { UserLayoutProps } from "./useUserLayout";

export default function UserHeader(props: UserLayoutProps) {
  const { token } = theme.useToken();

  return (
    <Layout.Header
      style={{ backgroundColor: token.colorBgContainer }}
      className="h-16! p-0!"
    >
      <main
        className={twJoin(
          props.contentClass,
          "flex items-center gap-3 md:gap-6 h-full px-4 md:px-8",
        )}
      >
        <button
          type="button"
          onClick={props.toggleMenu}
          className="hover:text-yellow-600 text-xl"
        >
          <MenuOutlined />
        </button>

        <h1 className="font-medium text-2xl whitespace-nowrap text-ellipsis">
          {props.title}
        </h1>

        <div className="grow" />

        <NotificationBell className="mr-2! lg:mr-4!" />

        <section className="hidden lg:flex items-center gap-2">
          <Button
            size="small"
            icon={<ReloadOutlined className="text-[0.8em]" />}
          >
            Actualiser
          </Button>

          <Button
            size="small"
            icon={<FileExcelOutlined className="text-[0.8em]" />}
          >
            Rapport
          </Button>

          <Button size="small" type="primary">
            Nouvelle demande
          </Button>
        </section>
      </main>
    </Layout.Header>
  );
}
