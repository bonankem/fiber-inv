import { Select, type SelectProps } from "antd";
import { useMemo } from "react";
import type { StaffRole } from "schema/enums";
import { vendorZ } from "schema/people";
import { zArray } from "schema/utils";
import { useApiGet } from "#/api/helpers";

type Props = Omit<SelectProps, "options"> & {
  staffRole?: StaffRole | StaffRole[];
};

export default function VendorSelect({ staffRole, ...props }: Props) {
  const query = useApiGet("vendors", zArray(vendorZ));

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
