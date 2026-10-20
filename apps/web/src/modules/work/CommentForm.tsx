import { Form, Input } from "antd";
import type { WorkT, WorkUpdateT } from "schema/work";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import type { ModalItemProps } from "#/hooks/useModalViewer";

export default function CommentForm(props: ModalItemProps<{ work: WorkT }>) {
  const submitM = useApiPost<WorkUpdateT>("/fhs/comment");

  const onSubmit = apiCall(async (data: WorkUpdateT) => {
    data.id = props.item.work.id;
    await submitM.mutateAsync(data);
    props.state.close();
  });

  return (
    <FormModal
      title="Ajouter un commentaire"
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
    >
      <Form.Item name="comment" label="Commentaire">
        <Input.TextArea rows={6} className="resize-none!" required />
      </Form.Item>
    </FormModal>
  );
}
