import { Form, message } from "antd";
import { m } from "i18n/messages";
import type { FhsAssignT, FtthSurveyT } from "schema/fhs";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import StaffSelect from "#/components/inputs/StaffSelect";
import VendorSelect from "#/components/inputs/VendorSelect";
import { req } from "#/utils/form";
import type { FhsFormProps } from "../fhs-types";

export default function FhsAssignForm(props: FhsFormProps) {
  const submitM = useApiPost<FhsAssignT, FtthSurveyT>("/fhs/assign");

  const onSubmit = apiCall(async (data: FhsAssignT) => {
    data.id = props.item.id;
    const result = await submitM.mutateAsync(data);
    message.success(`Assigned ${result.work.sid}`);
    props.state.close();
  });

  return (
    <FormModal
      title={m.fhs_form_assign()}
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
    >
      <Form.Item name="userId" label={m.assignee()} {...req}>
        <StaffSelect filter="PLANNING_ENGINEER" />
      </Form.Item>

      <Form.Item name="vendorId" label={m.field_vendor()}>
        <VendorSelect placeholder={m.optional()} />
      </Form.Item>
    </FormModal>
  );
}
