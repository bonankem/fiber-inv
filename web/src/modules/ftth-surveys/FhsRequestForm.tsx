import { Form, Input } from "antd";
import { WorkDocType } from "schema/enums";
import FormModal from "#/components/FormModal";
import CitySelect from "#/components/inputs/CitySelect";
import CoordsInput from "#/components/inputs/CoordsInput";
import FileUpload from "#/components/inputs/FileUpload";
import StaffSelect from "#/components/inputs/StaffSelect";
import type { ModalStateProps } from "#/hooks/useModalViewer";

export default function FhsRequestForm(props: ModalStateProps) {
  return (
    <FormModal state={props.state} title="Demande d'etude FTTH">
      <Form.Item
        name={WorkDocType.PLAQUE_KMZ}
        label="Fichier KMZ de la plaque"
        required
      >
        <FileUpload
          accept=".kml,.kmz"
          placeholder="Choisir un fichier KMZ ou KML"
        />
      </Form.Item>

      <Form.Item name="cityId" label="Ville" required>
        <CitySelect />
      </Form.Item>

      <Form.Item name="coords" label="Coordonnées" required>
        <CoordsInput required size="small" />
      </Form.Item>

      <Form.Item name="name" label="Nom de la plaque" required>
        <Input required />
      </Form.Item>

      <Form.Item name="contact" label="Contact local" required>
        <Input required placeholder="Nom et téléphone" />
      </Form.Item>

      <Form.Item name="managerId" label="Envoyer à responsable" required>
        <StaffSelect filter="PLANNING_MANAGER" />
      </Form.Item>

      <Form.Item name="comment" label="Commentaire">
        <Input.TextArea rows={3} className="resize-none!" />
      </Form.Item>
    </FormModal>
  );
}
