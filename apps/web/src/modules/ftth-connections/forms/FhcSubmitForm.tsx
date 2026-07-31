import { Checkbox, Form, Input, message, Select } from "antd";
import { m } from "i18n/messages";
import { useMemo } from "react";
import { indexBy } from "remeda";
import { BoxType, WorkDocType as Doc } from "schema/enums";
import type { FhcSubmitT, FtthConnectionT } from "schema/fhc";
import { boxZ } from "schema/network";
import { zArray } from "schema/utils";
import { workDocZ } from "schema/work";
import { apiCall, useApiGet, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import ImageUpload from "#/components/inputs/ImageUpload";
import IntInput from "#/components/inputs/IntInput";
import type { FhcFormProps } from "../fhc-types";

const fatTypes: BoxType[] = [BoxType.SUB, BoxType.END];

export default function FhcSubmitForm({ item, state }: FhcFormProps) {
  const boxes = useApiGet("/network/boxes", zArray(boxZ));
  const send = useApiPost<FhcSubmitT, FtthConnectionT>("/fhc/submit");
  const [form] = Form.useForm<FhcSubmitT>();
  const newPole = Form.useWatch("newPole", form);

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

  const onSubmit = apiCall(async (data: FhcSubmitT) => {
    data.id = item.id;
    const result = await send.mutateAsync(data);
    message.success(`Submitted ${result.work.sid}`);
    state.close();
  });

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
      width={720}
      title={m.fhc_form_submit()}
      subtitle={`${item.tn}: ${item.work.name}`}
      className="grid md:grid-cols-[2fr_1fr] gap-x-8"
      onSubmit={onSubmit}
      checkbox={false} // we have our own checkbox
      initialValues={initialValues}
    >
      <section className="grid md:grid-cols-2 gap-x-2">
        {img(Doc.FHC_CABLE_AT_FAT, "Drop Cable at FAT")}
        {img(Doc.FHC_FAT_POWER_TEST, "FAT Power Test")}
        {img(Doc.FHC_CABLE_AT_CUSTOMER, "Cable at Customer Premises")}
        {img(Doc.FHC_ATB_POWER_TEST, "ATB Power Test")}
        {img(Doc.FHC_ONT_INDICATORS, "ONT Indicators")}
        {img(Doc.FHC_ONT_NAMEPLATE, "ONT Nameplate")}
        {img(Doc.FHC_SPEED_TEST, "Speed Test")}
        {img(Doc.FHC_POLE, "Pole", newPole)}
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
            options={boxes.data
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

        <section className="mt-4">
          <Checkbox required>{m.check_confirm()}</Checkbox>
        </section>
      </section>
    </FormModal>
  );
}
