import { useQuery } from "@tanstack/react-query";
import { Select, type SelectProps } from "antd";
import { useEffect, useMemo } from "react";
import type { StaffRole } from "schema/enums";
import type { UserT } from "schema/people";
import { getJson } from "#/api/helpers";

type Props = Omit<SelectProps, "options"> & {
  filter?: StaffRole | StaffRole[];
};

export default function StaffSelect({ filter, ...props }: Props) {
  const query = useQuery({
    queryFn: () => getJson<UserT[]>("users"),
    queryKey: ["users"],
  });

  const options = useMemo(() => {
    const all = query.data ?? [];
    const filtered = !filter?.length
      ? all.filter((u) => u.staffRole)
      : Array.isArray(filter)
        ? all.filter((u) => u.staffRole && filter.includes(u.staffRole))
        : all.filter((u) => u.staffRole === filter);
    return filtered.map((u) => ({ label: u.name, value: u.id }));
  }, [query.data, filter]);

  // if a value is required and only one option exists, pick that one
  const { allowClear, value, onChange } = props;
  const mustSelect = !allowClear && !value;
  const singleValue = options.length === 1 ? options[0].value : null;
  useEffect(() => {
    if (mustSelect && singleValue) onChange?.(singleValue);
  }, [singleValue, onChange, mustSelect]);

  return (
    <Select
      {...props}
      options={options}
      loading={query.isLoading || props.loading}
      showSearch={{ optionFilterProp: "label" }}
      classNames={{ popup: { listItem: "text-sm!" } }}
    />
  );
}
