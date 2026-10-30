import { Select, type SelectProps } from "antd";
import { m } from "i18n/messages";
import { useEffect, useMemo, useState } from "react";
import type { FhsBomEquipmentT } from "schema/fhs";
import { equipmentPageZ } from "schema/inventory";
import { useApiGet } from "#/api/helpers";

export type EquipmentOptionT = FhsBomEquipmentT;

type Props = Omit<
  SelectProps,
  "options" | "value" | "onChange" | "showSearch"
> & {
  value?: EquipmentOptionT;
  onChange?: (item: EquipmentOptionT) => void;
  /** IDs already used elsewhere, hidden from the options */
  exclude?: string[];
};

export default function EquipmentSelect(props: Props) {
  const { value, onChange, exclude, ...rest } = props;
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const list = useApiGet("inventory/equipment", equipmentPageZ, {
    search: query || undefined,
    pageSize: 20,
  });

  const byId = useMemo(() => {
    const map = new Map<string, EquipmentOptionT>();
    if (value) map.set(value.id, value);
    for (const item of list.data?.items ?? []) map.set(item.id, item);
    return map;
  }, [value, list.data]);

  const options = useMemo(() => {
    return [...byId.values()]
      .filter((e) => e.id === value?.id || !exclude?.includes(e.id))
      .map((e) => ({ value: e.id, label: e.name, item: e }));
  }, [byId, value, exclude]);

  return (
    <Select
      {...rest}
      value={value?.id}
      options={options}
      loading={list.isFetching}
      placeholder={rest.placeholder ?? m.bom_search()}
      onChange={(id: string) => {
        const item = byId.get(id);
        if (item) onChange?.(item);
      }}
      showSearch={{ filterOption: false, onSearch: setSearch }}
      onOpenChange={(open) => !open && setSearch("")}
      popupMatchSelectWidth={false}
      classNames={{ popup: { listItem: "text-sm!" } }}
      optionRender={(opt) => (
        <div className="flex flex-col py-0.5 max-w-md">
          <span className="truncate">{opt.data.item.name}</span>
          <span className="text-xs opacity-60">
            {opt.data.item.mtnCode}
            {opt.data.item.ifsCode && ` · ${opt.data.item.ifsCode}`}
            {" · "}
            {m.bom_in_stock()}: {opt.data.item.available}
          </span>
        </div>
      )}
    />
  );
}
