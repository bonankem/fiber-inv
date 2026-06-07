import { Form, Input, InputNumber } from "antd";
import { m } from "i18n/messages";
import type { FhsInitiateT } from "schema/fhs";
import FormModal from "#/components/FormModal";
import DateInput from "#/components/inputs/DateInput";
import VendorSelect from "#/components/inputs/VendorSelect";
import { req } from "#/utils/form";
import { type FhsFormProps, useFhsUpdate } from "../fhs-types";

async function validateDates(start: unknown, due: unknown) {
  if (!start || !due || start <= due) return;
  throw new Error(`${m.field_start_date()} > ${m.field_due_date()}`);
}

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
      title={m.fhs_form_initiate()}
      className="grid sm:grid-cols-2 gap-2"
      initialValues={{ vendorId, startDate: today }}
    >
      <Form.Item
        name="vendorId"
        label={m.field_vendor()}
        className="col-span-full"
        {...req}
      >
        <VendorSelect />
      </Form.Item>

      <Form.Item
        name="startDate"
        label={m.field_start_date()}
        className="col-span-full"
        {...req}
      >
        <DateInput />
      </Form.Item>

      <Form.Item
        name="dueDate"
        label={m.field_due_date()}
        className="col-span-full"
        required
        rules={[{ required: true }]}
      >
        <DateInput />
      </Form.Item>

      <Form.Item name="ftthCode" label={m.field_olt_code()} {...req}>
        <Input
          required
          minLength={5}
          maxLength={5}
          placeholder="5 caractères"
        />
      </Form.Item>

      <Form.Item name="proposedHp" label={m.field_proposed_hp()} {...req}>
        <InputNumber className="w-full!" min={0} required />
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
