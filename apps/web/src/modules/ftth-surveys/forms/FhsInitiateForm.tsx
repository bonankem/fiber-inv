import { Form, Input, InputNumber, Select } from "antd";
import { m } from "i18n/messages";
import type { FhsInitiateT } from "schema/fhs";
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

  const vendorId = props.item.work.vendor?.id;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <FormModal
      {...up}
      width={600}
      title={m.fhs_form_initiate()}
      className="grid sm:grid-cols-2 gap-2"
      initialValues={{ vendorId, startDate: today }}
    >
      <Form.Item name="vendorId" label={m.field_vendor()} {...req}>
        <VendorSelect />
      </Form.Item>

      <Form.Item name="proposedHp" label={m.field_proposed_hp()} {...req}>
        <InputNumber className="w-full!" min={0} required />
      </Form.Item>

      <Form.Item name="startDate" label={m.field_start_date()} {...req}>
        <DateInput />
      </Form.Item>

      <Form.Item
        name="dueDate"
        label={m.field_due_date()}
        required
        rules={[{ required: true }]}
      >
        <DateInput />
      </Form.Item>

      <Form.Item name="isNewArea" label={m.area_type()} {...req}>
        <Select
          options={[
            { value: true, label: m.new_area() },
            { value: false, label: m.existing_area() },
          ]}
        />
      </Form.Item>

      <Form.Item name="areaCode" label={m.plaque_code()} {...req}>
        <Input
          required
          minLength={5}
          maxLength={5}
          placeholder={m.area_code_hint()}
        />
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
