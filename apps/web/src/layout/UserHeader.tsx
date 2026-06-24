import {
  FileExcelOutlined,
  MenuOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useLocation } from "@tanstack/react-router";
import { Button, Layout, theme } from "antd";
import { m } from "i18n/messages";
import { twJoin } from "tailwind-merge";
import { type ModalFC, useModalViewer } from "#/hooks/useModalViewer";
import AuthLogsModal from "#/modules/admin/AuthLogsModal";
import SyslogForm from "#/modules/admin/SyslogForm";
import FhcRequestForm from "#/modules/ftth-connections/FhcRequestForm";
import FhpRequestForm from "#/modules/ftth-projects/FhpRequestForm";
import FhsRequestForm from "#/modules/ftth-surveys/FhsRequestForm";
import StaffCreateForm from "#/modules/staff/StaffCreateForm";
import UserInfoModal from "#/modules/staff/UserInfoModal";
import NotificationBell from "./NotificationBell";
import type { UserLayoutProps } from "./useUserLayout";

const newForms: Record<string, ModalFC> = {
  "ftth-surveys": FhsRequestForm,
  "ftth-projects": FhpRequestForm,
  "ftth-connections": FhcRequestForm,
  staff: StaffCreateForm,
  security: SyslogForm,
};

const titles: Record<string, string> = {
  staff: m.add_staff(),
  security: m.syslog_server(),
};

export default function UserHeader(props: UserLayoutProps) {
  const { token } = theme.useToken();
  const modal = useModalViewer();

  const { pathname } = useLocation();
  const pathKey = pathname.split("/")[1].toLowerCase();
  const newForm = newForms[pathKey];

  const onReport = () => {
    if (pathKey === "staff") {
      modal.open(UserInfoModal);
    }
    if (pathKey === "security") {
      modal.open(AuthLogsModal);
    }
  };

  return (
    <Layout.Header
      style={{ backgroundColor: token.colorBgContainer }}
      className="h-16! p-0!"
    >
      <main
        className={twJoin(
          props.contentClass,
          "flex items-center gap-5 h-full px-4 md:px-8 overflow-hidden!",
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
            {m.refresh()}
          </Button>

          {
            <Button
              size="small"
              icon={<FileExcelOutlined className="text-[0.8em]" />}
              onClick={onReport}
            >
              {m.report()}
            </Button>
          }

          {newForm && (
            <Button
              size="small"
              type="primary"
              onClick={() => modal.open(newForm)}
            >
              {titles[pathKey] || m.new_request()}
            </Button>
          )}
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
