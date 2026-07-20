import { Form, Input, message } from "antd";
import { m } from "i18n/messages";
import type { FhpReviewT, FtthProjectT } from "schema/fhp";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import type { FhpFormProps } from "../fhp-types";

export default function FhpAcceptForm(props: FhpFormProps) {
  const send = useApiPost<FhpReviewT, FtthProjectT>("/fhp/review");

  const onSubmit = apiCall(async (data: FhpReviewT) => {
    data.id = props.item.id;
    data.passed = true;
    const result = await send.mutateAsync(data);
    message.success(`${result.work.sid} closed`);
    props.state.close();
  });

  return (
    <FormModal
      title={m.fhp_form_accept()}
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
      submitting={send.isPending}
    >
      <Form.Item name="comment" label={m.field_comment()}>
        <Input.TextArea
          rows={3}
          className="resize-none!"
          placeholder="Facultatif"
        />
      </Form.Item>
    </FormModal>
  );
}
