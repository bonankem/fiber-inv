import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Input, InputNumber, message } from "antd";
import type { FhsInitiateT, FtthSurveyT } from "schema/fhs";
import { apiCall, postFn } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import DateInput from "#/components/inputs/DateInput";
import VendorSelect from "#/components/inputs/VendorSelect";
import { req } from "#/utils/form";
import type { FhsFormProps } from "./fhs-types";

async function validateDates(start: unknown, due: unknown) {
  if (!start || !due || start <= due) return;
  throw new Error("Date de début > Date d'échéance");
}

export default function FhsInitiateForm(props: FhsFormProps) {
  const qc = useQueryClient();
  const submitM = useMutation({
    mutationFn: postFn<FhsInitiateT, FtthSurveyT>("/fhs/initiate"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fhs"] }),
  });

  const onSubmit = apiCall(async (data: FhsInitiateT) => {
    data.id = props.item.id;
    const result = await submitM.mutateAsync(data);
    message.success(`Initiated ${result.work.sid}`);
    props.state.close();
  });

  return (
    <FormModal
      title="Initiate FTTH survey"
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

      <Form.Item name="oltCode" label="Code OLT" {...req}>
        <Input
          required
          minLength={5}
          maxLength={5}
          placeholder="5 caractères"
        />
      </Form.Item>

      <Form.Item name="proposedHp" label="EL proposé" {...req}>
        <InputNumber className="w-full!" min={0} required />
      </Form.Item>

      <Form.Item name="comment" label="Commentaire" className="col-span-full">
        <Input.TextArea rows={3} className="resize-none!" />
      </Form.Item>
    </FormModal>
  );
}
