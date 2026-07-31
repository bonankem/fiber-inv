import { Form, Input, message } from "antd";
import { m } from "i18n/messages";
import type { FhsAssignT, FtthSurveyT } from "schema/fhs";
import type { WorkUpdateT } from "schema/work";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import { req } from "#/utils/form";
import type { FhsFormProps } from "../fhs-types";

export default function FhsDeclineForm(props: FhsFormProps) {
  const submitM = useApiPost<WorkUpdateT, FtthSurveyT>("/fhs/decline");

  const onSubmit = apiCall(async (data: FhsAssignT) => {
    data.id = props.item.id;
    const result = await submitM.mutateAsync(data);
    message.success(`Declined ${result.work.sid}`);
    props.state.close();
  });

  return (
    <FormModal
      title={m.fhs_form_decline()}
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
    >
      <Form.Item name="comment" label={m.comment()} {...req}>
        <Input.TextArea
          rows={3}
          required
          className="resize-none!"
          placeholder={m.decline_reason()}
        />
      </Form.Item>
    </FormModal>
  );
}
