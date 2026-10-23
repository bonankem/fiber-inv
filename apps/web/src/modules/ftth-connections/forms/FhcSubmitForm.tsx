import { Form, Input, message, Select } from "antd";
import { m } from "i18n/messages";
import { useEffect, useMemo } from "react";
import { indexBy } from "remeda";
import { WorkDocType as Doc, FhcCostCategory, FhcMode } from "schema/enums";
import {
  type FhcSubmitT,
  type FtthConnectionT,
  fhcCostCategoryOf,
} from "schema/fhc";
import { fatZ } from "schema/network";
import { filterTruthy } from "schema/utils";
import { workDocZ } from "schema/work";
import { apiCall, showAppError, useApiGet, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import ImageUpload from "#/components/inputs/ImageUpload";
import IntInput from "#/components/inputs/IntInput";
import { req } from "#/utils/form";
import { type FhcFormProps, fhcModeSelect, yesNoSelect } from "../fhc-types";
import FhcPbInput from "./FhcPbInput";

export default function FhcSubmitForm({ item, state }: FhcFormProps) {
  const [form] = Form.useForm<FhcSubmitT>();

  const fatQ = useApiGet("/network/fat", fatZ.array());
  const send = useApiPost<FhcSubmitT, FtthConnectionT>("/fhc/submit");

  const mode = Form.useWatch("mode", form);
  const distance = Form.useWatch("distance", form);
  const withPole = Form.useWatch("withPole", form);
  const category = fhcCostCategoryOf({ mode, distance, withPole });
  const usesPb = category === FhcCostCategory.PRICE_BOOK;

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

  const onSubmit = apiCall(async (data: FhcSubmitT) => {
    data.id = item.id;
    if (!usesPb) {
      data.quantities = undefined;
    } else {
      const values = filterTruthy(Object.values(data.quantities ?? {}));
      if (!values.some(Boolean)) return showAppError("No quantities");
    }

    const result = await send.mutateAsync(data);
    message.success(`Submitted ${result.work.sid}`);
    state.close();
  });

  const isCabledBuilding = mode === FhcMode.CABLED_BUILDING;
  useEffect(() => {
    if (isCabledBuilding) {
      form.setFieldsValue({ distance: 0, withPole: false });
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
      width={720}
      title={m.fhc_form_submit()}
      subtitle={`${item.tn}: ${item.work.name}`}
      onSubmit={onSubmit}
      okText={m.send()}
      submitting={send.isPending}
      initialValues={initialValues}
    >
      <section
        id="submit-part-1"
        className="grid md:grid-cols-[3fr_2fr] gap-x-6"
      >
        <section className="grid md:grid-cols-2 gap-x-2">
          {img(Doc.FHC_CABLE_AT_FAT, m.fhc_cable_at_fat())}
          {img(Doc.FHC_FAT_POWER_TEST, m.fhc_fat_power_test())}
          {img(Doc.FHC_CABLE_AT_CUSTOMER, m.fhc_cable_at_customer())}
          {img(Doc.FHC_ATB_POWER_TEST, m.fhc_atb_power_test())}
          {img(Doc.FHC_ONT_NAMEPLATE, m.fhc_ont_nameplate())}
          {img(Doc.FHC_ONT_INDICATORS, m.fhc_ont_indicators())}
          {img(Doc.FHC_SPEED_TEST, m.fhc_speed_test())}
          {img(Doc.FHC_POLE, m.fhc_pole())}
        </section>

        <section className="flex flex-col">
          <Form.Item name="ontSerial" label={m.ont_serial_number()} required>
            <Input
              required
              minLength={8}
              onChange={(e) => guessOem(e.target.value)}
            />
          </Form.Item>

          <Form.Item name="fatId" label={m.fat()} {...req}>
            <Select
              showSearch={{ optionFilterProp: "label" }}
              options={fatQ.data?.map((o) => ({ value: o.id, label: o.name }))}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-x-2">
            <Form.Item name="fatPort" label={m.fat_port()} required>
              <IntInput required controls={false} min={1} max={8} />
            </Form.Item>

            <Form.Item name="ontOem" label="ONT OEM" required>
              <Select
                options={[
                  { value: "huawei", label: "Huawei" },
                  { value: "zte", label: "ZTE" },
                ]}
              />
            </Form.Item>
          </div>

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
        </section>
      </section>

      {usesPb && (
        <Form.Item name="quantities" label={m.quantities()}>
          <FhcPbInput />
        </Form.Item>
      )}
    </FormModal>
  );
}
