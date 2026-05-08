import { Form, Input, Select } from "antd";
import FileUpload from "#/components/FileUpload";
import FormModal from "#/components/FormModal";
import TownSelect from "#/components/TownSelect";
import type { ModalStateProps } from "#/hooks/useModalViewer";

export default function FhsRequestForm(props: ModalStateProps) {
  return (
    <FormModal
      state={props.state}
      title="Demande d'etude FTTH"
      className="grid grid-cols-1 gap-2"
    >
      <Form.Item label="Fichier KMZ de la plaque">
        <FileUpload placeholder="Choisir un fichier KMZ ou KML" />
      </Form.Item>

      <Form.Item label="Ville">
        <TownSelect />
      </Form.Item>

      <Form.Item label="Nom de la plaque">
        <Input required />
      </Form.Item>

      <Form.Item label="Contact local">
        <Input required placeholder="Nom et téléphone" />
      </Form.Item>

      <Form.Item label="Envoyer à responsable">
        <Select />
      </Form.Item>

      <Form.Item label="Commentaire">
        <Input.TextArea rows={3} className="resize-none!" />
      </Form.Item>
    </FormModal>
  );
}
