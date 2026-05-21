import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DatePicker, Form, Input, InputNumber, message } from "antd";
import type { FhsInitiateT, FtthSurveyT } from "schema/fhs";
import { apiCall, postFn } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import DateInput from "#/components/inputs/DateInput";
import VendorSelect from "#/components/inputs/VendorSelect";
import type { ModalItemProps } from "#/hooks/useModalViewer";
import { req } from "#/utils/form";

export default function FhsInitiateForm(props: ModalItemProps<FtthSurveyT>) {
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
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        name="vendorId"
        label="Vendor"
        className="col-span-full"
        {...req}
      >
        <VendorSelect />
      </Form.Item>

      <Form.Item name="startDate" label="Date de début" {...req}>
        <DateInput />
      </Form.Item>

      <Form.Item name="dueDate" label="Date limite" {...req}>
        <DatePicker className="w-full" />
      </Form.Item>

      <Form.Item name="oltCode" label="Code OLT" {...req}>
        <Input
          required
          minLength={5}
          maxLength={5}
          placeholder="5 caractères"
        />
      </Form.Item>

      <Form.Item name="proposedHP" label="EL proposé" {...req}>
        <InputNumber className="w-full!" min={0} required />
      </Form.Item>

      <Form.Item name="comment" label="Commentaire" className="col-span-full">
        <Input.TextArea rows={3} className="resize-none!" />
      </Form.Item>
    </FormModal>
  );
}
