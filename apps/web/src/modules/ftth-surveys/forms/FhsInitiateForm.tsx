import { Form, Input, InputNumber } from "antd";
import type { ConfigType } from "dayjs";
import dayjs from "dayjs";
import { m } from "i18n/messages";
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
  const start = Form.useWatch("startDate", form);

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
      width={400}
      title={m.fhs_form_initiate()}
      className="grid sm:grid-cols-2 gap-2"
      initialValues={{
        vendorId: props.item.work.vendor?.id,
        startDate: new Date().toISOString().slice(0, 10),
      }}
    >
      <Form.Item name="vendorId" label={m.field_vendor()} {...req}>
        <VendorSelect />
      </Form.Item>

      <Form.Item name="expectedHp" label={m.expected_hp()} {...req}>
        <InputNumber className="w-full!" min={0} required />
      </Form.Item>

      <Form.Item name="startDate" label={m.field_start_date()} {...req}>
        <DateInput />
      </Form.Item>

      <Form.Item
        name="dueDate"
        label={m.due_date()}
        required
        rules={[...req.rules, { validator: checkDueDate }]}
      >
        <DateInput minDate={start} />
      </Form.Item>

      <Form.Item name="comment" label={m.comment()} className="col-span-full">
        <Input.TextArea rows={3} className="resize-none!" />
      </Form.Item>
    </FormModal>
  );
}
