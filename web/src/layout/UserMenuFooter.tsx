import {
  CheckOutlined,
  FontColorsOutlined,
  LockOutlined,
  LogoutOutlined,
  MoreOutlined,
  SunOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Tooltip } from "antd";
import { getLocale, setLocale } from "i18n/runtime";
import { useModalViewer } from "#/hooks/useModalViewer";
import LogoutModal from "#/modules/auth/LogoutModal";
import { useAppTheme } from "#/theme";

type Props = {
  collapsed?: boolean;
};

const themes = [
  { key: "system", label: "System" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
] as const;

const languages = [
  { key: "en", label: "English" },
  { key: "fr", label: "Français" },
] as const;

export default function UserMenuFooter({ collapsed }: Props) {
  const modal = useModalViewer();
  const theme = useAppTheme();
  const locale = getLocale();

  const check = (selected: string, item: { key: string }) => {
    if (selected !== item.key) return undefined;
    return <CheckOutlined className="ml-2 text-yellow-600!" />;
  };

  const logout = () => {
    modal.open(LogoutModal);
  };

  return (
    <Tooltip title="User Options" placement={collapsed ? "right" : "topRight"}>
      <Dropdown
        trigger={["click"]}
        placement="topRight"
        menu={{
          items: [
            {
              key: "language",
              label: "Language",
              icon: <FontColorsOutlined />,
              children: languages.map((l) => ({
                key: l.key,
                label: l.label,
                onClick: () => setLocale(l.key),
                itemIcon: check(locale, l),
              })),
            },
            {
              key: "theme",
              label: "Theme",
              icon: <SunOutlined />,
              children: themes.map((t) => ({
                key: t.key,
                label: t.label,
                onClick: () => theme.setValue(t.key),
                itemIcon: check(theme.value, t),
              })),
            },
            { type: "divider" },
            {
              key: "password",
              label: "Change Password",
              icon: <LockOutlined />,
            },
            {
              key: "logout",
              label: "Log out",
              icon: <LogoutOutlined />,
              onClick: logout,
            },
          ],
        }}
      >
        <Button
          block
          type="text"
          className="rounded-none! h-16! text-start! px-4 gap-0! flex items-center"
        >
          <Avatar className="shrink-0 m-0!">
            <UserOutlined />
          </Avatar>

          {!collapsed && (
            <div className="py-2 pl-3 grow">
              <div>Leo Aso</div>
              <div className="text-sm font-semibold ">Admin</div>
            </div>
          )}

          {!collapsed && <MoreOutlined className="text-xl!" />}
        </Button>
      </Dropdown>
    </Tooltip>
  );
}
