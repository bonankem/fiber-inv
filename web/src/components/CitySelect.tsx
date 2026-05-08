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
const cities = new Set(data.flatMap((d) => d.children.map((c) => c.value)));
const cityDistrict = Object.fromEntries(
  data.flatMap((d) => d.children.map((c) => [c.value, d.value])),
);

type AntProps = Pick<CascaderAutoProps, "size" | "className" | "placeholder">;

type Props = AntProps & {
  value?: string;
  onChange?: (v: string | undefined) => void;
  canPickDistrict?: boolean;
};

function actualValue(v: string | undefined) {
  console.log("value =", v);
  const value = !v ? undefined : cities.has(v) ? [cityDistrict[v], v] : [v];
  console.log("actual value =", value);
  return value;
}

export default function CitySelect(props: Props) {
  const ref = useRef<HTMLElement>(null);

  return (
    <Cascader
      ref={ref}
      {...props}
      value={actualValue(props.value)}
      options={data}
      multiple={false}
      expandTrigger="click"
      classNames={{
        popup: { list: "max-h-[40dvh] lg:max-h-[65dvh]! text-sm!" },
      }}
      onChange={(v) => {
        const oc = props.onChange;
        if (!oc) return;
        if (!v) return oc(undefined);

        const n = v.length;
        const value = v[n - 1];
        if (cities.has(value) || props.canPickDistrict) {
          oc(value);
          if (n > 1) ref.current?.blur();
        }
      }}
      changeOnSelect={props.canPickDistrict}
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
