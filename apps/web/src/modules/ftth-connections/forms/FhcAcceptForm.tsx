import { Form, Input, message } from "antd";
import { m } from "i18n/messages";
import type { FtthConnectionT } from "schema/fhc";
import type { FhpReviewT } from "schema/fhp";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import type { FhcFormProps } from "../fhc-types";

export default function FhcAcceptForm(props: FhcFormProps) {
  const submitM = useApiPost<FhpReviewT, FtthConnectionT>("/fhc/review");

  const onSubmit = apiCall(async (data: FhpReviewT) => {
    data.id = props.item.id;
    data.passed = true;
    const result = await submitM.mutateAsync(data);
    message.success(`${result.work.sid} approved`);
    props.state.close();
  });

  return (
    <FormModal
      title={m.action_accept()}
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
    >
      <Form.Item name="comment" label={m.field_comment()}>
        <Input.TextArea
          rows={3}
          className="resize-none!"
          placeholder={m.optional()}
        />
      </Form.Item>
    </FormModal>
  );
}
