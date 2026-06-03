import { Card } from "antd";
import type { ReactNode } from "react";
import { filterTruthy, type Maybe } from "schema/utils";
import { twJoin } from "tailwind-merge";

type Missing = "hide" | "dash" | "blank";

type Item = {
  key?: string;
  label: ReactNode;
  value?: ReactNode;
  vertical?: boolean;
  missing?: Missing;
};

type Props = {
  items: Maybe<Item>[];
  title?: ReactNode;
  vertical?: boolean;
  missing?: Missing;
  className?: string;
};

function itemKey({ key, label }: Item, index?: number) {
  if (key) return key;
  if (label && typeof label === "string") return label;
  return index;
}

function Dash() {
  return <span className="text-gray-300 dark:text-gray-600">&mdash;</span>;
}

export default function DetailsCard(props: Props) {
  const items = filterTruthy(props.items);
  function row(i: Item, index: number) {
    const m = i.missing || props.missing;
    const v = i.vertical || props.vertical;
    const value = i.value ?? (m === "dash" ? <Dash /> : "");
    if (value === "" && m === "hide") return null;

    return (
      <article
        key={itemKey(i, index)}
        className={twJoin(
          "text-sm",
          !v && "flex flex-row justify-between items-start gap-1",
        )}
      >
        <div className="shrink-0 text-gray-400">{i.label}</div>
        <div className={twJoin(!v && "text-end")}>{value}</div>
      </article>
    );
  }
  return (
    <Card
      className={props.className}
      classNames={{ body: "px-6! py-4! overfflow-hidden!" }}
    >
      {props.title && <h3 className="mb-2 font-medium">{props.title}</h3>}
      <section className="flex flex-col gap-2">
        {filterTruthy(items).map(row)}
      </section>
    </Card>
  );
}
