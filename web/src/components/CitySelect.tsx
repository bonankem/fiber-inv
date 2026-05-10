/** biome-ignore-all lint/suspicious/noArrayIndexKey: not a problem here */

import { useQuery } from "@tanstack/react-query";
import { Cascader, type CascaderAutoProps } from "antd";
import { useMemo, useRef } from "react";
import type { DistrictNestedT } from "schema/geo";
import { getJson } from "#/api/helpers";
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

function makeEntry(d: { id: string; key: string; name: string }) {
  return {
    value: d.id,
    label: d.name,
    search: d.key,
    "aria-label": d.name,
    "data-title": d.name,
  };
}

type AntProps = Pick<CascaderAutoProps, "size" | "className" | "placeholder">;

type Props = AntProps & {
  value?: string;
  onChange?: (v: string | undefined) => void;
  canPickDistrict?: boolean;
};

function renderName(path: string[]) {
  if (path.length === 1) return `${path[0]} (District)`;
  return path.join(" / ");
}

export default function CitySelect(props: Props) {
  const ref = useRef<HTMLElement>(null);
  const query = useQuery({
    queryFn: () => getJson<DistrictNestedT[]>("geo/districts"),
    queryKey: ["cities"],
  });

  const data = useMemo(() => {
    const list = query.data ?? [];
    const options = list.map((d) => ({
      ...makeEntry(d),
      children: d.cities.map(makeEntry),
    }));

    const districtIds = new Set(list.map((d) => d.id));
    const cityMap = Object.fromEntries(
      list.flatMap((d) => d.cities.map((c) => [c.id, d.id])),
    );
    return { options, cityMap, districtIds };
  }, [query.data]);

  const value = useMemo((): string[] | undefined => {
    const id = props.value;
    if (!id) return undefined;
    if (id in data.districtIds && props.canPickDistrict) return [id] as const;

    const districtId = data.cityMap[id];
    if (districtId) return [districtId, id] as const;

    return undefined;
  }, [props.value, props.canPickDistrict, data]);

  const onChange = (v: string[] | null | undefined) => {
    const id = v?.[v.length - 1]?.toString();
    props.onChange?.(id || undefined);
  };

  return (
    <Cascader
      ref={ref}
      {...props}
      value={value}
      onChange={onChange}
      loading={query.isLoading}
      options={data.options}
      classNames={{
        popup: { list: "max-h-[40dvh] lg:max-h-[65dvh]! text-sm!" },
      }}
      changeOnSelect={props.canPickDistrict}
      displayRender={renderName}
      showSearch={{
        filter: (input, path) => {
          const { key } = makeInputKey(input);
          return path.some((p) => p.search?.includes(key));
        },
        render: (input, path) => {
          const { rex } = makeInputKey(input);
          const labels = path.map((p) => p.label);
          return withSearchHighlights(renderName(labels), rex);
        },
      }}
    />
  );
}
