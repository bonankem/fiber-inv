import { Alert, Form, Input } from "antd";
import FormModal from "#/components/FormModal";
import type { ModalStateProps } from "#/hooks/useModalViewer";

export default function StaffCreateForm(props: ModalStateProps) {
  return (
    <FormModal state={props.state} title="Ajouter du personnel">
      <Form.Item label="Email">
        <Input type="email" />
      </Form.Item>

      <Form.Item label="Name">
        <Input type="text" />
      </Form.Item>

      <Alert
        type="info"
        showIcon
        className="text-sm!"
        title="L'utilisateur recevra un courriel de connexion, comprenant un mot de passe temporaire généré automatiquement."
      />
    </FormModal>
  );
}
