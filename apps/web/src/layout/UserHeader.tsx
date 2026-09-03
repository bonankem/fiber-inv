import {
  EditOutlined,
  MenuOutlined,
  PlusOutlined,
  ReloadOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useLocation } from "@tanstack/react-router";
import { Button, Dropdown, Layout, theme } from "antd";
import { m } from "i18n/messages";
import { userFullZ } from "schema/people";
import { twJoin } from "tailwind-merge";
import { useApiGet } from "#/api/helpers";
import { type ModalFC, useModalViewer } from "#/hooks/useModalViewer";
import AuthLogsModal from "#/modules/admin/AuthLogsModal";
import SyslogForm from "#/modules/admin/SyslogForm";
import FhcRequestForm from "#/modules/ftth-connections/FhcRequestForm";
import FhcRequestManyForm from "#/modules/ftth-connections/FhcRequestManyForm";
import FhpRequestForm from "#/modules/ftth-projects/FhpRequestForm";
import FhsRequestForm from "#/modules/ftth-surveys/FhsRequestForm";
import StaffCreateForm from "#/modules/staff/StaffCreateForm";
import UserInfoModal from "#/modules/staff/UserInfoModal";
import NotificationBell from "./NotificationBell";
import ReportButton from "./ReportButton";
import type { UserLayoutProps } from "./useUserLayout";

type MultiForm = {
  name: string;
  form: ModalFC;
  icon?: typeof EditOutlined;
};
const newForms: Record<string, ModalFC | MultiForm[]> = {
  "ftth-surveys": FhsRequestForm,
  "ftth-projects": FhpRequestForm,
  "ftth-connections": [
    {
      name: m.input_manually(),
      form: FhcRequestForm,
      icon: EditOutlined,
    },
    {
      name: m.read_from_file(),
      form: FhcRequestManyForm,
      icon: UnorderedListOutlined,
    },
  ],
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
  const userQ = useApiGet("session/user", userFullZ);
  const user = userQ.data;

  const canCreate = !!(user?.isAdmin || user?.staffRole);

  const reports: Record<
    string,
    { path: string; name?: string; action?: () => void }
  > = {
    "ftth-connections": { path: "/fhc/report", name: "fhc" },
    staff: { path: "", action: () => modal.open(UserInfoModal) },
    security: { path: "", action: () => modal.open(AuthLogsModal) },
  };
  const report = reports[pathKey];

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

          {report && <ReportButton {...report} />}

          {canCreate && typeof newForm === "function" && (
            <Button
              size="small"
              type="primary"
              onClick={() => modal.open(newForm)}
            >
              {titles[pathKey] || m.new_request()}
            </Button>
          )}

          {canCreate && Array.isArray(newForm) && (
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              menu={{
                items: newForm.map((e) => ({
                  key: e.name,
                  icon: e.icon && <e.icon />,
                  label: e.name,
                  onClick: () => modal.open(e.form),
                })),
              }}
            >
              <Button size="small" type="primary">
                {titles[pathKey] || m.new_request()}
              </Button>
            </Dropdown>
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
