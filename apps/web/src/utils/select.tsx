import type { SelectProps } from "antd";
import type { IdNameT } from "schema/common";
import type { Maybe } from "schema/utils";

type Opt = string | IdNameT;

const optValue = (o: Opt) => (typeof o === "string" ? o : o.id);
const optLabel = (o: Opt) => (typeof o === "string" ? o : o.name);

export function selectProps<T extends Opt>(values: Maybe<T[]>) {
  const options = values?.map((o) => ({
    value: optValue(o),
    label: optLabel(o),
  }));
  return {
    options,
    showSearch: { optionFilterProp: "label" },
  } satisfies SelectProps;
}
