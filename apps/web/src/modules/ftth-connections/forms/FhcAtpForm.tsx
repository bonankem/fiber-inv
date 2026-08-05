import { Form, Input, message } from "antd";
import { m } from "i18n/messages";
import type { FtthConnectionT } from "schema/fhc";
import type { WorkUpdateT } from "schema/work";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import AttachmentUpload from "#/components/inputs/AttachmentUpload";
import { req } from "#/utils/form";
import type { FhcFormProps } from "../fhc-types";

type Props = FhcFormProps & {
  passed: boolean;
};

function FhcAtpForm({ passed, ...props }: Props) {
  const submitM = useApiPost<WorkUpdateT, FtthConnectionT>(
    passed ? "/fhc/atp-pass" : "/fhc/atp-fail",
  );
  const title = passed ? "Pass ATP" : "Fail ATP";

  const onSubmit = apiCall(async (data: WorkUpdateT) => {
    data.id = props.item.work?.id ?? props.item.id;
    const result = await submitM.mutateAsync(data);
    message.success(`${result.work.sid} ATP ${passed ? "passed" : "failed"}`);
    props.state.close();
  });

  return (
    <FormModal
      title={title}
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
      submitting={submitM.isPending}
    >
      <Form.Item
        name="comment"
        label={passed ? m.comment() : "Reason"}
        {...(passed ? {} : req)}
      >
        <Input.TextArea
          rows={3}
          required={!passed}
          className="resize-none!"
          placeholder={passed ? m.optional() : "Reason for failed ATP..."}
        />
      </Form.Item>

      <Form.Item name="uploads" label="Attachments">
        <AttachmentUpload />
      </Form.Item>
    </FormModal>
  );
}

export function FhcAtpPassForm(props: FhcFormProps) {
  return <FhcAtpForm {...props} passed />;
}

export function FhcAtpFailForm(props: FhcFormProps) {
  return <FhcAtpForm {...props} passed={false} />;
}
