import { theme } from "antd";
import { Subset } from "schema/common";
import type { Maybe } from "schema/utils";
import { twJoin } from "tailwind-merge";

type Props<T> = {
  items: { key: T; label: string }[];
  selected?: T;
  onSelect?: (key: T) => void;
  counts?: Record<T & string, Maybe<number>>;
};

function SubsetCard(props: {
  label: string;
  count: Maybe<number>;
  active: boolean;
  onClick: () => void;
  plainBg?: string;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={twJoin(
        "h-15 rounded-md cursor-pointer overflow-hidden",
        "flex justify-between items-center text-start",
        props.active && "bg-[#ffcb05]! text-black!",
      )}
      style={{
        backgroundColor: props.active ? "#ffcb05" : props.plainBg || "white",
      }}
    >
      <div className="w-full flex flex-col leading-0 text-center md:text-start mx-1 md:mx-4 overflow-hidden">
        <div className="text-sm md:text-base font-bold">
          {props.count ?? "-"}
        </div>
        <div className="text-xs md:text-sm whitespace-nowrap text-ellipsis">
          {props.label}
        </div>
      </div>
    </button>
  );
}

export default function SubsetCards<T extends string>(props: Props<T>) {
  const { token } = theme.useToken();
  return (
    <nav className="grid grid-cols-5 gap-2 sm:gap-3">
      {props.items.map((c) => (
        <SubsetCard
          key={c.key}
          label={c.label}
          count={props.counts?.[c.key]}
          active={c.key === props.selected}
          onClick={() => props.onSelect?.(c.key)}
          plainBg={token.colorBgContainer}
        />
      ))}
    </nav>
  );
}

const defaultItems = [
  { key: Subset.TOTAL, label: "Toutes" },
  { key: Subset.MY_PENDING, label: "Mes tâches" },
  { key: Subset.OPEN, label: "Ouvertes" },
  { key: Subset.STOPPED, label: "Écartées" },
  { key: Subset.CLOSED, label: "Terminées" },
];

SubsetCards.Default = (props: Omit<Props<Subset>, "items">) => (
  <SubsetCards {...props} items={defaultItems} />
);
