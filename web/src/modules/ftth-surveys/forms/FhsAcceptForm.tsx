import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Input, message } from "antd";
import type { FhsReviewT, FtthSurveyT } from "schema/fhs";
import { apiCall, postFn } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import type { FhsFormProps } from "../fhs-types";

export default function FhsAcceptForm(props: FhsFormProps) {
  const qc = useQueryClient();
  const submitM = useMutation({
    mutationFn: postFn<FhsReviewT, FtthSurveyT>("/fhs/review"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fhs"] }),
  });

  const onSubmit = apiCall(async (data: FhsReviewT) => {
    data.id = props.item.id;
    data.passed = true;
    const result = await submitM.mutateAsync(data);
    message.success(`${result.work.sid} approved`);
    props.state.close();
  });

  return (
    <FormModal
      title="Accepter le rapport"
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
    >
      <Form.Item name="comment" label="Commentaire">
        <Input.TextArea
          rows={3}
          className="resize-none!"
          placeholder="Facultatif"
        />
      </Form.Item>
    </FormModal>
  );
}
