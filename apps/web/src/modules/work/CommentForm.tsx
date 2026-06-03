import { Form, Input } from "antd";
import type { WorkT } from "schema/work";
import FormModal from "#/components/FormModal";
import type { ModalItemProps } from "#/hooks/useModalViewer";

export default function CommentForm(props: ModalItemProps<{ work: WorkT }>) {
  return (
    <FormModal
      title="Ajouter un commentaire"
      subtitle={props.item.work.name}
      state={props.state}
    >
      <Form.Item name="comment" label="Commentaire">
        <Input.TextArea rows={6} className="resize-none!" required />
      </Form.Item>
    </FormModal>
  );
}
