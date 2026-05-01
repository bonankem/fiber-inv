import { Link, useLocation } from "@tanstack/react-router";
import { type DrawerProps, Grid, type MenuProps, type SiderProps } from "antd";
import { useMemo, useState } from "react";
import { navigationData } from "#/data/navigation";
import { useAppTheme } from "#/theme";

export type UserLayoutProps = ReturnType<typeof useUserLayout>;

export function useUserLayout() {
  const menuWidth = 240;
  const contentClass = "w-full max-w-480 mx-auto h-full overflow-x-hidden";

  const [iconOnly, setIconOnly] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const colorTheme = useAppTheme().isDark ? "dark" : "light";
  const isDrawer = !Grid.useBreakpoint().lg;
  const collapsed = iconOnly && !isDrawer;
  const path = useLocation().pathname;

  const toggleMenu = () => {
    if (isDrawer) setDrawerOpen((b) => !b);
    else setIconOnly((b) => !b);
  };

  const items = useMemo(() => {
    return navigationData.flatMap((g) => [
      {
        key: g.name,
        type: "group" as const,
        label: collapsed ? "" : g.name,
        children: g.list.map((i) => ({
          key: i.path,
          label: <Link to={i.path}>{i.name}</Link>,
          onClick: () => setDrawerOpen(false),
          icon: (
            <Link to={i.path}>
              <i.icon size={collapsed ? 18 : 14} />
            </Link>
          ),
        })),
      },
      { type: "divider" as const },
    ]);
  }, [collapsed]);

  const selected = useMemo(
    () =>
      navigationData
        .flatMap((m) => m.list)
        .find((i) => path.startsWith(i.path)),
    [path],
  );

  const title = selected?.name || "ServiceX";

  const drawer = {
    placement: "left",
    closable: false,
    title: null,
    size: menuWidth,
    open: isDrawer && isDrawerOpen,
    onClose: () => setDrawerOpen(false),
  } satisfies DrawerProps;

  const sider = {
    width: menuWidth,
    collapsed,
    onCollapse: setIconOnly,
    collapsible: !isDrawer,
    collapsedWidth: isDrawer ? 0 : 64,
    theme: colorTheme,
    trigger: null,
  } satisfies SiderProps;

  const menu = {
    items,
    mode: "inline",
    theme: colorTheme,
    selectedKeys: selected ? [selected.path] : [],
  } satisfies MenuProps;

  return {
    items,
    title,
    drawer,
    sider,
    menu,
    collapsed,
    isDrawer,
    toggleMenu,
    contentClass,
  };
}
