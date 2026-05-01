/** biome-ignore-all lint/suspicious/noArrayIndexKey: not a problem here */
import { Cascader, type CascaderAutoProps } from "antd";
import { useRef } from "react";
import { locations } from "#/data/locations";
import {
  makeSearchKey,
  makeSearchRexFromKey,
  withSearchHighlights,
} from "#/utils/search";

let memo = { input: "", key: "", rex: / / };
function makeInputKey(input: string) {
  if (input === memo.input) return memo;
  const key = makeSearchKey(input);
  const rex = makeSearchRexFromKey(key);
  memo = { input, key, rex };
  return memo;
}

function makeEntry(label: string, value = makeSearchKey(label)) {
  return { value, label, "aria-label": label, "data-title": label };
}

const data = [
  ...locations.map((d) => ({
    ...makeEntry(d.name),
    children: d.list.map((n) => makeEntry(n)),
  })),
];

export default function TownSelect(props: Omit<CascaderAutoProps, "options">) {
  const ref = useRef<HTMLElement>(null);

  return (
    <Cascader
      ref={ref}
      // biome-ignore lint/suspicious/noExplicitAny: suppress false-negative type error
      {...(props as any)}
      options={data}
      expandTrigger="click"
      classNames={{
        popup: { list: "max-h-[40dvh] lg:max-h-[65dvh]! text-sm!" },
      }}
      onChange={(v) => v.length > 1 && ref.current?.blur()}
      displayRender={(l) =>
        l.length === 1 ? `${l[0]} (District)` : l.join(" / ")
      }
      showSearch={{
        filter: (input, path) => {
          const { key } = makeInputKey(input);
          return path.some((p) => (p.value as string)?.includes(key));
        },
        render: (input, path) => {
          const { rex } = makeInputKey(input);
          const l = path.map((p) => p.label);
          const text = l.length === 1 ? `${l[0]} (District)` : l.join(" / ");
          return withSearchHighlights(text, rex);
        },
      }}
    />
  );
}
