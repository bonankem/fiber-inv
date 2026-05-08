import { useQuery } from "@tanstack/react-query";
import { Select, type SelectProps } from "antd";
import { useEffect, useMemo } from "react";
import type { StaffRole } from "schema/enums";
import type { UserT } from "schema/people";
import { getJson } from "#/api/helpers";

type BaseProps = Omit<SelectProps, "options">;

type Props = BaseProps & {
  staffRole?: StaffRole | StaffRole[];
};

export default function StaffSelect({ staffRole, ...props }: Props) {
  const query = useQuery({
    queryFn: () => getJson<UserT[]>("users"),
    queryKey: ["users"],
  });
  const users = useMemo(() => {
    const all = query.data;
    if (!all?.length) return [];

    if (Array.isArray(staffRole) && staffRole.length) {
      const set = new Set(staffRole);
      return all.filter((u) => u.staffRole && set.has(u.staffRole));
    }
    if (staffRole) {
      return all.filter((u) => u.staffRole === staffRole);
    }
    return all.filter((u) => u.staffRole);
  }, [query.data, staffRole]);

  const { allowClear, value, onChange } = props;
  const singleOption = users.length === 1 ? users[0].id : null;
  useEffect(() => {
    // if a value must be selected and only one option exists, pick that one
    if (!allowClear && !value && singleOption) onChange?.(singleOption);
  }, [allowClear, value, singleOption, onChange]);

  return (
    <Select
      {...props}
      showSearch={{ optionFilterProp: "label" }}
      options={users?.map((u) => ({ label: u.name, value: u.id }))}
      loading={query.isLoading}
    />
  );
}
