import { Link, type LinkProps, useLocation } from "@tanstack/react-router";
import {
  type DrawerProps,
  Grid,
  type MenuProps,
  type MenuTheme,
  type SiderProps,
} from "antd";
import type { MenuItemGroupType } from "antd/es/menu/interface";
import {
  BriefcaseBusiness,
  HandshakeIcon,
  Home,
  HousePlug,
  PencilRuler,
  UserIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

export type UmIcon = typeof Home;

export type UmPath = NonNullable<LinkProps["to"]>;

export type UmItem = {
  path: UmPath;
  name: string;
  icon: UmIcon;
};

function item(path: UmPath, name: string, icon: UmIcon): UmItem {
  return { path, name, icon };
}

function group(name: string, list: UmItem[]) {
  return { name, list };
}

const userMenuData = [
  group("", [item("/overview", "Overview", Home)]),
  group("FTTH", [
    item("/ftth-surveys", "Etudes FTTH", PencilRuler),
    item("/ftth-projects", "Projets FTTH", BriefcaseBusiness),
    item("/ftth-connections", "Connexions FTTH", HousePlug),
  ]),
  group("Gestion", [
    item("/staff", "Personnel de MTN", UserIcon),
    item("/vendors", "Fournisseurs", HandshakeIcon),
  ]),
];

export type UserMenuData = ReturnType<typeof useUserMenu>;

export function useUserMenu(width = 240) {
  const [iconOnly, setIconOnly] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const colorTheme: MenuTheme = "light";
  const isDrawer = !Grid.useBreakpoint().lg;
  const collapsed = iconOnly && !isDrawer;
  const path = useLocation().pathname;

  const toggle = () => {
    if (isDrawer) setDrawerOpen((b) => !b);
    else setIconOnly((b) => !b);
  };

  const items = useMemo((): MenuItemGroupType[] => {
    return userMenuData.map((g) => ({
      key: g.name,
      type: "group" as const,
      label: collapsed ? "" : g.name,
      children: g.list.map((i) => ({
        key: i.path,
        label: <Link to={i.path}>{i.name}</Link>,
        onClick: () => setDrawerOpen(false),
        icon: (
          <Link to={i.path}>
            <i.icon size={collapsed ? 20 : 16} />
          </Link>
        ),
      })),
    }));
  }, [collapsed]);

  const selected = useMemo(() => {
    const flatItems = userMenuData.flatMap((m) => m.list);
    return flatItems.find((i) => path.startsWith(i.path));
  }, [path]);

  const pageTitle = selected?.name || "ServiceX";

  const drawerProps = {
    placement: "left",
    closable: false,
    title: null,
    size: width,
    open: isDrawer && isDrawerOpen,
    onClose: () => setDrawerOpen(false),
  } satisfies DrawerProps;

  const siderProps = {
    width,
    collapsed,
    onCollapse: setIconOnly,
    collapsible: !isDrawer,
    collapsedWidth: isDrawer ? 0 : 64,
    theme: colorTheme,
    trigger: null,
  } satisfies SiderProps;

  const menuProps = {
    items,
    mode: "inline",
    theme: colorTheme,
    selectedKeys: selected ? [selected.path] : [],
  } satisfies MenuProps;

  return {
    items,
    pageTitle,
    drawerProps,
    siderProps,
    menuProps,
    isDrawer,
    toggle,
  };
}
