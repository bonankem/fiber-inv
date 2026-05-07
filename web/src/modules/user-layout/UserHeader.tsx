import {
  FileExcelOutlined,
  MenuOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Layout, theme } from "antd";
import { twJoin } from "tailwind-merge";
import { useModalViewer } from "#/hooks/useModalViewer";
import FhsRequestForm from "../ftth-surveys/FhsRequestForm";
import NotificationBell from "./NotificationBell";
import type { UserLayoutProps } from "./useUserLayout";

export default function UserHeader(props: UserLayoutProps) {
  const { token } = theme.useToken();
  const modal = useModalViewer();

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

        <section
          id="header-actions-desktop"
          className="hidden lg:flex items-center gap-2"
        >
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

          <Button
            size="small"
            type="primary"
            onClick={() => modal.open(FhsRequestForm)}
          >
            Nouvelle demande
          </Button>
        </section>

        <section id="header-actions-mobile" className="mr-2 block lg:hidden">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => modal.open(FhsRequestForm)}
          />
        </section>
      </main>
    </Layout.Header>
  );
}
