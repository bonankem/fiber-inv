import { EllipsisOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  type ButtonProps,
  Dropdown,
  type MenuProps,
} from "antd";
import { useMemo } from "react";
import { partition } from "remeda";
import { twJoin } from "tailwind-merge";
import { useModalViewer } from "#/hooks/useModalViewer";
import { type AnyActions, useActions } from "./types";

type Props<T> = {
  actions: AnyActions<T>;
  item: T;
};

export default function ActionsButton<T>(props: Props<T>) {
  const item = props.item;
  const actions = useActions(props.actions, item);
  const modals = useModalViewer();

  type Items = NonNullable<MenuProps["items"]>;
  type Action = (typeof actions)[number];

  const { type, items } = useMemo(() => {
    const [main, other] = partition(actions, (a) => a.main);
    const [mr, mp] = partition(main, (a) => a.red); // main red vs plain
    const [or, op] = partition(other, (a) => a.red); // other red vs plain
    const needDiv = !!(main.length && other.length);
    const divider = needDiv ? [{ type: "divider" as const }] : [];

    const menuItem = (a: Action): Items[number] => ({
      type: "item" as const,
      key: a.key || a.name,
      label: a.name,
      icon: a.icon ? <a.icon className="text-sm!" /> : undefined,
      onClick: () => {
        const form = a.form;
        if (form) modals.openWith(form, item);
      },
      className: twJoin(
        "text-sm!",
        a.main && !a.red && "text-green-600!",
        a.red && "text-red-400!",
      ),
    });
    const items = [
      ...mp.map(menuItem),
      ...mr.map(menuItem),
      ...divider,
      ...op.map(menuItem),
      ...or.map(menuItem),
    ];
    const type: ButtonProps["type"] = main.length ? "primary" : "text";
    return { type, items };
  }, [actions, item, modals.openWith]);

  return (
    <Badge dot={type === "primary"}>
      <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
        <Button size="small" type={type} className="px-2! h-6!">
          <EllipsisOutlined className="text-xl lg:text-2xl" />
        </Button>
      </Dropdown>
    </Badge>
  );
}
