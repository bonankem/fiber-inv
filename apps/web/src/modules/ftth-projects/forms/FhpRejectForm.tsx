import { Form, Input, message } from "antd";
import { m } from "i18n/messages";
import type { FhpReviewT, FtthProjectT } from "schema/fhp";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import { req } from "#/utils/form";
import type { FhpFormProps } from "../fhp-types";

export default function FhpRejectForm(props: FhpFormProps) {
  const send = useApiPost<FhpReviewT, FtthProjectT>("/fhp/review");

  const onSubmit = apiCall(async (data: FhpReviewT) => {
    data.id = props.item.id;
    data.passed = false;
    const result = await send.mutateAsync(data);
    message.success(`${result.work.sid} rejetée`);
    props.state.close();
  });

  return (
    <FormModal
      title="Rejeter le rapport"
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
      submitting={send.isPending}
    >
      <Form.Item name="comment" label={m.field_comment()} {...req}>
        <Input.TextArea
          rows={3}
          required
          className="resize-none!"
          placeholder="Motif du rejet du rapport..."
        />
      </Form.Item>
    </FormModal>
  );
}
