import { Form, Input, message } from "antd";
import type { FtthConnectionT } from "schema/fhc";
import type { FhsReviewT } from "schema/fhs";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import { req } from "#/utils/form";
import type { FhcFormProps } from "../fhc-types";

export default function FhcRejectForm(props: FhcFormProps) {
  const submitM = useApiPost<FhsReviewT, FtthConnectionT>("/fhc/review");

  const onSubmit = apiCall(async (data: FhsReviewT) => {
    data.id = props.item.id;
    data.passed = false;
    const result = await submitM.mutateAsync(data);
    message.success(`${result.work.sid} rejetée`);
    props.state.close();
  });

  return (
    <FormModal
      title="Rejeter"
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
    >
      <Form.Item name="comment" label="Motif" {...req}>
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
