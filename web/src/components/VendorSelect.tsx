import { useQuery } from "@tanstack/react-query";
import { Select, type SelectProps } from "antd";
import { useMemo } from "react";
import type { StaffRole } from "schema/enums";
import type { VendorT } from "schema/people";
import { getJson } from "#/api/helpers";

type Props = Omit<SelectProps, "options"> & {
  staffRole?: StaffRole | StaffRole[];
};

export default function VendorSelect({ staffRole, ...props }: Props) {
  const query = useQuery({
    queryFn: () => getJson<VendorT[]>("vendors"),
    queryKey: ["vendors"],
  });

  const options = useMemo(() => {
    return query.data?.map((v) => ({
      label: v.name,
      value: v.id,
    }));
  }, [query.data]);

  return (
    <Select
      {...props}
      options={options}
      loading={query.isLoading}
      showSearch={{ optionFilterProp: "label" }}
      classNames={{ popup: { listItem: "text-sm!" } }}
    />
  );
}
