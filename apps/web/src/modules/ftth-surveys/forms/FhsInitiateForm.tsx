import { Form, Input, InputNumber } from "antd";
import type { ConfigType } from "dayjs";
import dayjs from "dayjs";
import { m } from "i18n/messages";
import { useState } from "react";
import type { FhsInitiateT } from "schema/fhs";
import type { Maybe } from "schema/utils";
import FormModal from "#/components/FormModal";
import DateInput from "#/components/inputs/DateInput";
import VendorSelect from "#/components/inputs/VendorSelect";
import { req } from "#/utils/form";
import { type FhsFormProps, useFhsUpdate } from "../fhs-types";

export default function FhsInitiateForm(props: FhsFormProps) {
  const up = useFhsUpdate<FhsInitiateT>(
    "/fhs/initiate",
    props,
    m.toast_initiated,
  );

  const [form] = Form.useForm<FhsInitiateT>();
  const vendorId = props.item.work.vendor?.id;
  const today = new Date().toISOString().slice(0, 10);
  const start = Form.useWatch("startDate", form);
  const [isNew, setIsNew] = useState<boolean>();

  const checkDueDate = async (_: unknown, due: Maybe<ConfigType>) => {
    console.log(start, due);
    if (!start || !due) throw new Error("Both needed");
    console.log(start, due);
    if (start && due && dayjs(start).isAfter(due)) {
      throw new Error(m.start_past_due());
    }
  };

  return (
    <FormModal
      {...up}
      form={form}
      width={480}
      title={m.fhs_form_initiate()}
      className="grid sm:grid-cols-2 gap-2"
      initialValues={{ vendorId, startDate: today }}
    >
      <Form.Item name="areaCode" label={m.area_code()} {...req}>
        <Input
          required
          minLength={5}
          maxLength={5}
          placeholder={m.area_code_hint()}
        />
      </Form.Item>

      <Form.Item name="vendorId" label={m.field_vendor()} {...req}>
        <VendorSelect />
      </Form.Item>

      <Form.Item name="expectedHp" label={m.field_expected_hp()} {...req}>
        <InputNumber className="w-full!" min={0} required />
      </Form.Item>

      <Form.Item name="startDate" label={m.field_start_date()} {...req}>
        <DateInput />
      </Form.Item>

      <Form.Item
        name="dueDate"
        label={m.field_due_date()}
        required
        rules={[...req.rules, { validator: checkDueDate }]}
      >
        <DateInput />
      </Form.Item>

      <Form.Item
        name="comment"
        label={m.field_comment()}
        className="col-span-full"
      >
        <Input.TextArea rows={3} className="resize-none!" />
      </Form.Item>
    </FormModal>
  );
}
