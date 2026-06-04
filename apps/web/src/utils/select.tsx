import type { SelectProps } from "antd";
import type { Maybe } from "schema/utils";

export function selectProps<T extends string>(values: Maybe<T[]>) {
  const options = values?.map((v) => ({
    value: v,
    label: v,
  }));
  return {
    options,
    showSearch: { optionFilterProp: "label" },
  } satisfies SelectProps;
}
