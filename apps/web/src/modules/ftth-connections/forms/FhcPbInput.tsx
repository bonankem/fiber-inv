import { CloseOutlined } from "@ant-design/icons";
import { Button, InputNumber, Select, Space, Tooltip } from "antd";
import { m } from "i18n/messages";
import { getLocale } from "i18n/runtime";
import { useMemo, useState } from "react";
import { omit, partition } from "remeda";
import { type FhcPbItemT, fhcPbItemZ } from "schema/fhc";
import type { Maybe } from "schema/utils";
import { showAppError, useApiGet } from "#/api/helpers";
import DataTable from "#/components/data-page/DataTable";
import WithCaption from "#/components/WithCaption";
import FhcPbNameView from "../components/FchPbNameView";

const en = getLocale() === "en";

type Value = Record<string, number | undefined>;
type Props = {
  value?: Value;
  onChange?: (value: Value) => void;
};

export default function FhcPbInput(props: Props) {
  const query = useApiGet("/fhc/pricebook", fhcPbItemZ.array());
  const [pasting, setPasting] = useState(false);

  const data = useMemo(() => {
    const value = props.value ?? {};
    const list = query.data ?? [];
    const keys = new Set(Object.keys(value ?? {}));
    const [picked, unpicked] = partition(list, (item) => keys.has(item.ref));

    return { value, picked, unpicked };
  }, [query.data, props.value]);

  const onClickPastePb = () => {
    setPasting(true);
    navigator.clipboard
      .readText()
      .then((text) => pastePricebook(text))
      .finally(() => setPasting(false));
  };

  const pastePricebook = (text: string) => {
    const result = parseText(text, query.data);
    if (result) props.onChange?.(result);
  };

  return (
    <section id="submit-part-1">
      <DataTable
        data={data.picked}
        loading={pasting}
        cellClassName="my-0! py-0!"
        smallerText
        columns={[
          {
            key: "ref",
            title: "Ref",
            render: (p) => p.ref,
            width: 150,
          },
          {
            key: "quantity",
            title: m.qty(),
            render: ({ ref }) => (
              <Space.Compact>
                <Button
                  className="h-6! *:text-xs!"
                  size="small"
                  tabIndex={-1}
                  onClick={() => props.onChange?.(omit(data.value, [ref]))}
                  icon={<CloseOutlined className="text-red-700!" />}
                />
                <InputNumber
                  controls={false}
                  required
                  value={data.value[ref]}
                  onChange={(v) =>
                    props.onChange?.({ ...data.value, [ref]: v ?? undefined })
                  }
                  className="text-xs! h-6!"
                  classNames={{ input: "text-right! pr-3!" }}
                  size="small"
                  min={0}
                  precision={0}
                />
              </Space.Compact>
            ),
            width: 100,
          },
          {
            key: "name",
            title: m.name(),
            render: (p) => <FhcPbNameView item={p} />,
            width: 400,
          },
        ]}
        footer={
          <div className="flex gap-2">
            <Select
              className="w-80!"
              placement="topLeft"
              popupMatchSelectWidth={false}
              placeholder={m.select_from_price_book()}
              value={null as string | null}
              onChange={(ref) => {
                const i = ref && data.unpicked.find((i) => i.ref === ref);
                if (i) props.onChange?.({ ...data.value, [i.ref]: undefined });
              }}
              options={data.unpicked.map((item) => ({
                label: item.ref,
                value: item.ref,
                title: en ? item.nameEn : item.nameFr,
              }))}
              showSearch={{
                filterOption: (input, option) => {
                  if (!option) return false;
                  input = input.toUpperCase();
                  if (option.label.includes(input)) return true;
                  if (option.title.toUpperCase().includes(input)) return true;
                  return false;
                },
              }}
              optionRender={(o) => (
                <WithCaption
                  title={o.data.label}
                  caption={o.data.title}
                  className="max-w-100! text-xs!"
                />
              )}
            />

            <Tooltip title={m.pricebook_paste_hint()}>
              <Button onClick={onClickPastePb}>{m.paste_from_excel()}</Button>
            </Tooltip>
          </div>
        }
      />
    </section>
  );
}

function parseText(text: string, data: Maybe<FhcPbItemT[]>) {
  console.log("Hello!");
  const lines = text.split(/\r?\n/g).filter(Boolean);
  const table = lines.map((row) => row.split(/\t/).map((cell) => cell.trim()));

  // find the first row that has a price book ref
  const re = /^PB_DROP_FTTX_\d+$/;
  const first = table.find((row) => row.some((cell) => re.test(cell)));
  if (!first) {
    showAppError(m.no_items_in_paste());
    return null;
  }

  // only use the rows that have a value in the ref column
  const refCol = first.findIndex((cell) => re.test(cell));
  const rows = table.filter((row) => row[refCol]);

  // the title row should be immediately before the first item
  const start = rows.findIndex((row) => re.test(row[refCol]));
  const title = start - 1;
  const itemRows = rows.slice(start);

  const qtyRe = /^(Qt|Quantit)[yeé]$/i;
  let qtyCol = rows[title]?.findIndex((c) => qtyRe.test(c)) ?? -1;
  if (qtyCol < 0) {
    const allCols = itemRows[0].map((_, i) => i);
    const numCols = allCols.filter((col) =>
      itemRows.every((row) => /^\d+(,\d+)*(\.\d*)?$|^$/.test(row[col])),
    );
    console.log({ numCols });
    if (numCols.length === 1) {
      qtyCol = numCols[0];
    }
  }
  if (qtyCol < 0) {
    showAppError("Cannot find quantity column in pasted text");
    return null;
  }
  const result = {} as Record<string, number>;
  for (const row of itemRows) {
    const ref = row[refCol];
    const item = data?.find((i) => i.ref === ref);
    const qty = Number(row[qtyCol].replace(/,/g, ""));
    if (item && qty) result[item.ref] = qty;
  }
  return result;
}
