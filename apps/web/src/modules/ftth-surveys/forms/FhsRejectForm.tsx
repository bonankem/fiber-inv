import { Form, Input, message } from "antd";
import type { FhsReviewT, FtthSurveyT } from "schema/fhs";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import { req } from "#/utils/form";
import type { FhsFormProps } from "../fhs-types";

export default function FhsRejectForm(props: FhsFormProps) {
  const submitM = useApiPost<FhsReviewT, FtthSurveyT>("/fhs/review", ["fhs"]);

  const onSubmit = apiCall(async (data: FhsReviewT) => {
    data.id = props.item.id;
    data.passed = false;
    const result = await submitM.mutateAsync(data);
    message.success(`${result.work.sid} rejetée`);
    props.state.close();
  });

  return (
    <FormModal
      title="Rejeter le rapport"
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
