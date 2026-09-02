import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Tooltip,
} from "antd";
import { m } from "i18n/messages";
import { getLocale } from "i18n/runtime";
import { useEffect, useMemo, useState } from "react";
import { indexBy } from "remeda";
import { WorkDocType as Doc, FhcCostCategory, FhcMode } from "schema/enums";
import {
  type FhcSubmitT,
  type FtthConnectionT,
  fhcCostCategoryOf,
  fhcPbLineZ,
} from "schema/fhc";
import { fatZ } from "schema/network";
import { workDocZ } from "schema/work";
import { twMerge } from "tailwind-merge";
import { apiCall, useApiGet, useApiPost } from "#/api/helpers";
import DataTable from "#/components/data-page/DataTable";
import FormModal from "#/components/FormModal";
import ImageUpload from "#/components/inputs/ImageUpload";
import IntInput from "#/components/inputs/IntInput";
import { req } from "#/utils/form";
import { type FhcFormProps, fhcModeSelect, yesNoSelect } from "../fhc-types";

const isEnglish = getLocale() === "en";

export default function FhcSubmitForm({ item, state }: FhcFormProps) {
  const pricebookQ = useApiGet("/fhc/pricebook", fhcPbLineZ.array());

  const fatQ = useApiGet("/network/fat", fatZ.array());
  const send = useApiPost<FhcSubmitT, FtthConnectionT>("/fhc/submit");

  const [form] = Form.useForm<FhcSubmitT>();
  const [onCost, setOnCost] = useState(false);

  const mode = Form.useWatch("mode", form);
  const distance = Form.useWatch("distance", form);
  const withPole = Form.useWatch("withPole", form);
  const category = fhcCostCategoryOf({ mode, distance, withPole });
  const isPricebook = category === FhcCostCategory.PRICE_BOOK;
  const willSubmit = onCost || !isPricebook;

  const initialValues = useMemo(
    (): Partial<FhcSubmitT> => ({
      ontSerial: item.ontSerial || undefined,
      ontOem: item.ontOem?.key,
      fatId: item.fat?.id,
      fatPort: item.fatPort || undefined,
      distance: item.distance || undefined,
      withPole: item.withPole || undefined,
      mode: item.mode || undefined,
    }),
    [item],
  );

  const onBack = () => {
    if (!onCost) return false;
    setOnCost(false);
    return true;
  };

  const goToCost = async (data: FhcSubmitT) => {
    const cat = fhcCostCategoryOf(data);
    if (cat === FhcCostCategory.PRICE_BOOK) {
      form.setFieldValue("priceBook", {});
      setOnCost(true);
    } else {
      console.log(cat);
      await onSubmit(data);
    }
  };

  const onSubmit = apiCall(async (data: FhcSubmitT) => {
    data.id = item.id;
    const result = await send.mutateAsync(data);
    message.success(`Submitted ${result.work.sid}`);
    state.close();
  });

  const isCabledBuilding = mode === FhcMode.CABLED_BUILDING;
  useEffect(() => {
    if (isCabledBuilding) {
      form.setFieldsValue({ distance: 0, withPole: false });
    } else {
      form.setFieldsValue({ distance: undefined, withPole: undefined });
    }
  }, [form, isCabledBuilding]);

  const guessOem = (sn: string) => {
    console.log("Guess", sn);
    if (!sn) return;
    if (/^(HWTC|48575443)/.test(sn)) {
      form.setFieldsValue({ ontOem: "huawei" });
    } else if (/^ZTE/.test(sn)) {
      form.setFieldsValue({ ontOem: "zte" });
    }
    console.log(form.getFieldValue("ontOem"));
  };

  const docs = useApiGet(["work", item.id, "docs"], workDocZ.array());
  const docsByType = useMemo(
    () => indexBy(docs.data ?? [], (d) => d.type),
    [docs.data],
  );

  function img(type: Doc & `FHC_${string}`, label: string, required = true) {
    return (
      <Form.Item name={["images", type]} label={label} required={required}>
        <ImageUpload
          type={type}
          required={required}
          previous={docsByType[type]?.upload}
        />
      </Form.Item>
    );
  }

  return (
    <FormModal
      form={form}
      state={state}
      width={onCost ? 800 : 720}
      title={m.fhc_form_submit()}
      subtitle={`${item.tn}: ${item.work.name}`}
      onBack={onBack}
      onSubmit={onCost ? onSubmit : goToCost}
      okText={willSubmit ? m.send() : "Price book →"}
      submitting={send.isPending}
      checkbox={willSubmit}
      initialValues={initialValues}
    >
      <section
        id="submit-part-1"
        className={twMerge(
          "grid md:grid-cols-[3fr_2fr] gap-x-6",
          onCost && "hidden",
        )}
      >
        <section className="grid md:grid-cols-2 gap-x-2">
          {img(Doc.FHC_CABLE_AT_FAT, "Drop Cable at FAT")}
          {img(Doc.FHC_FAT_POWER_TEST, "FAT Power Test")}
          {img(Doc.FHC_CABLE_AT_CUSTOMER, "Cable at Customer")}
          {img(Doc.FHC_ATB_POWER_TEST, "ATB Power Test")}
          {img(Doc.FHC_ONT_INDICATORS, "ONT Indicators")}
          {img(Doc.FHC_ONT_NAMEPLATE, "ONT Nameplate")}
          {img(Doc.FHC_SPEED_TEST, "Speed Test")}
          {img(Doc.FHC_POLE, "Pole")}
        </section>

        <section className="flex flex-col">
          <Form.Item name="fatId" label={m.fat()} {...req}>
            <Select
              showSearch={{ optionFilterProp: "label" }}
              options={fatQ.data?.map((o) => ({ value: o.id, label: o.name }))}
            />
          </Form.Item>

          <Form.Item name="fatPort" label={m.fat_port()} required>
            <IntInput required controls={false} min={1} max={8} />
          </Form.Item>

          <Form.Item name="mode" label={m.mode_of_cabling()} {...req}>
            <Select options={fhcModeSelect} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-x-2">
            <Form.Item name="withPole" label={m.with_pole()} required>
              <Select options={yesNoSelect} disabled={isCabledBuilding} />
            </Form.Item>

            <Form.Item name="distance" label={m.distance()} required>
              <IntInput
                required
                suffix="m"
                controls={false}
                disabled={isCabledBuilding}
              />
            </Form.Item>
          </div>

          <Form.Item name="ontSerial" label={m.ont_serial_number()} required>
            <Input
              required
              minLength={8}
              onChange={(e) => guessOem(e.target.value)}
            />
          </Form.Item>

          <Form.Item name="ontOem" label="ONT OEM" required>
            <Select
              options={[
                { value: "huawei", label: "Huawei" },
                { value: "zte", label: "ZTE" },
              ]}
            />
          </Form.Item>
        </section>
      </section>

      <section id="submit-part-1" className={twMerge(!onCost && "hidden")}>
        <DataTable
          data={pricebookQ.data}
          smallerText
          cellClassName="my-0! py-0!"
          columns={[
            {
              key: "ref",
              title: "Ref",
              render: (p) => p.ref,
              width: 120,
            },
            {
              key: "quantity",
              title: m.qty(),
              render: ({ ref }) => (
                <Form.Item name={["priceBook", ref]} noStyle>
                  <PbQtyInput />
                </Form.Item>
              ),
              className: "flex! items-center!",
              width: 120,
            },
            {
              key: "name",
              title: m.name(),
              render: (p) => <PbNameView item={p} />,
              width: 500,
            },
          ]}
        />
      </section>
    </FormModal>
  );
}

function PbQtyInput(props: {
  value?: number | null;
  onChange?: (value: number | null) => void;
}) {
  return (
    <Space.Compact>
      <Button
        className="h-6! *:text-xs!"
        size="small"
        tabIndex={-1}
        onClick={() => props.onChange?.(props.value ? null : 1)}
        icon={
          props.value ? (
            <CloseOutlined className="text-red-700!" />
          ) : (
            <PlusOutlined />
          )
        }
      />
      <InputNumber
        controls={false}
        value={props.value}
        onChange={props.onChange}
        className="text-xs! h-6!"
        classNames={{ input: "text-right! pr-3!" }}
        size="small"
        min={0}
        precision={0}
      />
    </Space.Compact>
  );
}

function PbNameView(props: { item: { nameEn: string; nameFr: string } }) {
  const name = isEnglish ? props.item.nameEn : props.item.nameFr;

  return (
    <Tooltip
      title={name}
      placement="bottomLeft"
      className="w-fit"
      classNames={{ container: "whitespace-pre-line" }}
    >
      <span className="overflow-x-hidden max-w-full text-ellipsis">{name}</span>
    </Tooltip>
  );
}
