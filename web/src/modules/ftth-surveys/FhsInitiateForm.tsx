import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DatePicker, Form, Input, message } from "antd";
import type { FhsInitiateT, FtthSurveyT } from "schema/fhs";
import { apiCall, postFn } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import VendorSelect from "#/components/inputs/VendorSelect";
import type { ModalItemProps } from "#/hooks/useModalViewer";

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
    >
      <Form.Item
        name="vendorId"
        label="Vendor"
        required
        rules={[{ required: true }]}
      >
        <VendorSelect />
      </Form.Item>

      <div className="grid grid-cols-2 gap-2">
        <Form.Item name="startDate" label="Start Date">
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item name="dueDate" label="Due Date">
          <DatePicker className="w-full" />
        </Form.Item>
      </div>

      <Form.Item name="comment" label="Commentaire">
        <Input.TextArea rows={3} className="resize-none!" />
      </Form.Item>
    </FormModal>
  );
}
