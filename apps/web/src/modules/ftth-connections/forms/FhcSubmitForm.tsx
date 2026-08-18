import { Form, Input, InputNumber, message, Select } from "antd";
import { m } from "i18n/messages";
import { useMemo, useState } from "react";
import { indexBy } from "remeda";
import { WorkDocType as Doc } from "schema/enums";
import type { FhcSubmitT, FtthConnectionT } from "schema/fhc";
import { fatZ } from "schema/network";
import { workDocZ } from "schema/work";
import { twMerge } from "tailwind-merge";
import { apiCall, useApiGet, useApiPost } from "#/api/helpers";
import DataTable from "#/components/data-page/DataTable";
import FormModal from "#/components/FormModal";
import ImageUpload from "#/components/inputs/ImageUpload";
import IntInput from "#/components/inputs/IntInput";
import type { FhcFormProps } from "../fhc-types";

export default function FhcSubmitForm({ item, state }: FhcFormProps) {
  const fatQ = useApiGet("/network/fat", fatZ.array());
  const send = useApiPost<FhcSubmitT, FtthConnectionT>("/fhc/submit");

  const [form] = Form.useForm<FhcSubmitT>();
  const [onCost, setOnCost] = useState(false);

  const initialValues = useMemo(
    (): Partial<FhcSubmitT> => ({
      ontSerial: item.ontSerial || undefined,
      ontOem: item.ontOem?.key,
      fatId: item.fat?.id,
      fatPort: item.fatPort || undefined,
      distance: item.distance || undefined,
      withPole: item.withPole || undefined,
    }),
    [item],
  );

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
      subtitle={`${item.tn}: ${item.work.name}`}
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
          {img(Doc.FHC_POLE, "Pole")}
        </section>

        <section className="flex flex-col">
          <Form.Item name="withPole" label={m.with_pole()} required>
            <Select
              options={[
                { value: true, label: m.yes() },
                { value: false, label: m.no() },
              ]}
            />
          </Form.Item>

          <Form.Item name="fatId" label={m.fat_pbo()} required>
            <Select
              showSearch={{ optionFilterProp: "label" }}
              options={fatQ.data?.map((o) => ({ value: o.id, label: o.name }))}
            />
          </Form.Item>

          <Form.Item name="fatPort" label={m.fat_port()} required>
            <IntInput required controls={false} min={1} max={8} />
          </Form.Item>

          <Form.Item name="distance" label={m.distance()} required>
            <IntInput required suffix="m" controls={false} />
          </Form.Item>

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
          data={[]}
          columns={[
            {
              key: "quantity",
              title: "Qty",
              render: () => <InputNumber />,
              width: 100,
            },
          ]}
        />
      </section>
    </FormModal>
  );
}
