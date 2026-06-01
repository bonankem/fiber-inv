import { Form, message } from "antd";
import { StaffRole } from "schema/enums";
import type { FhsAssignT, FtthSurveyT } from "schema/fhs";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import StaffSelect from "#/components/inputs/StaffSelect";
import VendorSelect from "#/components/inputs/VendorSelect";
import type { FhsFormProps } from "../fhs-types";

export default function FhsAssignForm(props: FhsFormProps) {
  const submitM = useApiPost<FhsAssignT, FtthSurveyT>("/fhs/assign", ["fhs"]);

  const onSubmit = apiCall(async (data: FhsAssignT) => {
    data.id = props.item.id;
    const result = await submitM.mutateAsync(data);
    message.success(`Assigned ${result.work.sid}`);
    props.state.close();
  });

  return (
    <FormModal
      title="Assign FTTH survey"
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
    >
      <Form.Item
        name="userId"
        label="Engineer"
        required
        rules={[{ required: true }]}
      >
        <StaffSelect filter={StaffRole.PLANNING_ENGINEER} />
      </Form.Item>

      <Form.Item name="vendorId" label="Vendor">
        <VendorSelect placeholder="Optional" />
      </Form.Item>
    </FormModal>
  );
}
