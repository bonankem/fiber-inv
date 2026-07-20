import { Form, Input, message } from "antd";
import { m } from "i18n/messages";
import type { FhpInitiateT, FtthProjectT } from "schema/fhp";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import DateInput from "#/components/inputs/DateInput";
import VendorSelect from "#/components/inputs/VendorSelect";
import { req } from "#/utils/form";
import type { FhpFormProps } from "../fhp-types";

async function validateDates(start: unknown, due: unknown) {
  if (!start || !due || start <= due) return;
  throw new Error("Date de début > Date d'échéance");
}

export default function FhpInitiateForm(props: FhpFormProps) {
  const send = useApiPost<FhpInitiateT, FtthProjectT>("/fhp/initiate");

  const onSubmit = apiCall(async (data: FhpInitiateT) => {
    data.id = props.item.id;
    const result = await send.mutateAsync(data);
    message.success(`Initiated ${result.work.sid}`);
    props.state.close();
  });

  return (
    <FormModal
      title={m.fhp_form_initiate()}
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
      submitting={send.isPending}
      className="grid sm:grid-cols-2 gap-2"
      initialValues={{ vendorId: props.item.work.vendor?.id }}
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
        className="col-span-2"
        validateTrigger="onBlur"
        dependencies={["startDate"]}
        name="dueDate"
        rules={[
          (form) => ({
            validator: (_, value) =>
              validateDates(form.getFieldValue("startDate"), value),
          }),
        ]}
      >
        <div className="grid! sm:grid-cols-2 gap-2">
          <Form.Item name="startDate" label={m.field_start_date()} {...req}>
            <DateInput />
          </Form.Item>

          <Form.Item name="dueDate" label={m.field_due_date()} {...req}>
            <DateInput />
          </Form.Item>
        </div>
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
