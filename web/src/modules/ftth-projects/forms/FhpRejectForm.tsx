import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Input, message } from "antd";
import type { FhpReviewT, FtthProjectT } from "schema/fhp";
import { apiCall, postFn } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import { req } from "#/utils/form";
import type { FhpFormProps } from "../fhp-types";

export default function FhpRejectForm(props: FhpFormProps) {
  const qc = useQueryClient();
  const submitM = useMutation({
    mutationFn: postFn<FhpReviewT, FtthProjectT>("/fhp/review"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fhp"] }),
  });

  const onSubmit = apiCall(async (data: FhpReviewT) => {
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
