import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Input, message } from "antd";
import type { FhpInitiateT, FtthProjectT } from "schema/fhp";
import { apiCall, postFn } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import DateInput from "#/components/inputs/DateInput";
import VendorSelect from "#/components/inputs/VendorSelect";
import { req } from "#/utils/form";
import type { FhpFormProps } from "./fhp-types";

async function validateDates(start: unknown, due: unknown) {
  if (!start || !due || start <= due) return;
  throw new Error("Date de début > Date d'échéance");
}

export default function FhpInitiateForm(props: FhpFormProps) {
  const qc = useQueryClient();
  const submitM = useMutation({
    mutationFn: postFn<FhpInitiateT, FtthProjectT>("/fhp/initiate"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fhp"] }),
  });

  const onSubmit = apiCall(async (data: FhpInitiateT) => {
    data.id = props.item.id;
    const result = await submitM.mutateAsync(data);
    message.success(`Initiated ${result.work.sid}`);
    props.state.close();
  });

  return (
    <FormModal
      title="Initiate FTTH project"
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
      className="grid sm:grid-cols-2 gap-2"
    >
      <Form.Item
        name="vendorId"
        label="Vendor"
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
          <Form.Item name="startDate" label="Date de début" {...req}>
            <DateInput />
          </Form.Item>

          <Form.Item name="dueDate" label="Date d'échéance" {...req}>
            <DateInput />
          </Form.Item>
        </div>
      </Form.Item>

      <Form.Item name="comment" label="Commentaire" className="col-span-full">
        <Input.TextArea rows={3} className="resize-none!" />
      </Form.Item>
    </FormModal>
  );
}
