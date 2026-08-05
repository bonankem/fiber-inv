import { Form, Input, InputNumber, message, Select } from "antd";
import { m } from "i18n/messages";
import { getLocale } from "i18n/runtime";
import { useMemo, useState } from "react";
import { indexBy } from "remeda";
import { BoxType, WorkDocType as Doc } from "schema/enums";
import {
  type FhcSubmitT,
  type FtthConnectionT,
  fhcCostLineZ,
} from "schema/fhc";
import { boxZ } from "schema/network";
import { workDocZ } from "schema/work";
import { twMerge } from "tailwind-merge";
import { apiCall, useApiGet, useApiPost } from "#/api/helpers";
import DataTable from "#/components/data-page/DataTable";
import FormModal from "#/components/FormModal";
import ImageUpload from "#/components/inputs/ImageUpload";
import IntInput from "#/components/inputs/IntInput";
import type { FhcFormProps } from "../fhc-types";

const fatTypes: BoxType[] = [BoxType.SUB, BoxType.END];
const locale = getLocale();

export default function FhcSubmitForm({ item, state }: FhcFormProps) {
  const boxesQ = useApiGet("/network/boxes", boxZ.array());
  const costLinesQ = useApiGet("/fhc/cost-lines", fhcCostLineZ.array());
  const send = useApiPost<FhcSubmitT, FtthConnectionT>("/fhc/submit");

  const [form] = Form.useForm<FhcSubmitT>();
  const [onCost, setOnCost] = useState(false);
  const pole = Form.useWatch("newPole", form) || false;
  const dist = Form.useWatch("cableLength", form) || 0;

  const initialValues = useMemo(
    (): Partial<FhcSubmitT> => ({
      ontSerial: item.ontSerial || undefined,
      ontOem: item.ontOem?.key,
      fatId: item.fat?.id,
      fatPort: item.fatPort || undefined,
      cableLength: item.cableLength || undefined,
      newPole: item.newPole || undefined,
    }),
    [item],
  );

  const costLines = useMemo(() => {
    const all = costLinesQ.data;
    if (!all) return [];
    const filtered = all.filter((line) => {
      const c = line.condition;
      if (!c) return true;
      if (c.usesPole === 0 && pole) return false;
      if (c.usesPole === 1 && !pole) return false;
      if (c.minDistance && c.minDistance >= dist) return false;
      if (c.maxDistance && c.maxDistance < dist) return false;
      return true;
    });
    return filtered.map((l) => ({
      id: l.id,
      ref: l.ref,
      name: locale === "en" ? l.nameEn : l.nameFr,
    }));
  }, [costLinesQ.data, pole, dist]);

  const onSubmit = apiCall(async (data: FhcSubmitT) => {
    data.id = item.id;
    const result = await send.mutateAsync(data);
    message.success(`Submitted ${result.work.sid}`);
    state.close();
  });

  const onNext = (data: FhcSubmitT) => {
    if (onCost) return onSubmit(data);
    else setOnCost(true);
  };

  const onBack = () => {
    if (!onCost) return false;
    setOnCost(false);
    return true;
  };

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
      width={onCost ? 800 : 640}
      title={m.fhc_form_submit()}
      // preserve={state.isOpen}
      subtitle={`${item.tn}: ${item.work.name}`}
      className=""
      onBack={onBack}
      onSubmit={onNext}
      okText={onCost ? m.send() : m.continue()}
      checkbox={onCost}
      initialValues={initialValues}
    >
      <section
        id="submit-part-1"
        className={twMerge(
          "grid md:grid-cols-[3fr_2fr] gap-x-8",
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
          {img(Doc.FHC_POLE, "Pole", pole)}
        </section>

        <section className="flex flex-col">
          <Form.Item name="newPole" label="New Pole" required>
            <Select
              options={[
                { value: true, label: m.yes() },
                { value: false, label: m.no() },
              ]}
            />
          </Form.Item>

          <Form.Item name="fatId" label="FAT" required>
            <Select
              showSearch={{ optionFilterProp: "label" }}
              options={boxesQ.data
                ?.filter((p) => fatTypes.includes(p.type))
                ?.map((o) => ({ value: o.id, label: o.name }))}
            />
          </Form.Item>

          <Form.Item name="fatPort" label="FAT Port" required>
            <IntInput required controls={false} min={1} max={8} />
          </Form.Item>

          <Form.Item name="cableLength" label="Cable Length" required>
            <IntInput required suffix="m" controls={false} />
          </Form.Item>

          <Form.Item name="ontSerial" label="ONT Serial Number" required>
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
          data={costLines}
          columns={[
            {
              key: "quantity",
              title: "Qty",
              render: () => <InputNumber />,
              width: 100,
            },
            {
              key: "desc",
              title: "Cost Line Items",
              render: (t) => t.name,
              width: 400,
            },
            {
              key: "ref",
              title: "Ref",
              render: (t) => t.ref,
              width: 150,
            },
          ]}
        />
      </section>
    </FormModal>
  );
}