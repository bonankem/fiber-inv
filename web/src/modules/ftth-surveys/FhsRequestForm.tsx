import { Form, Input, message } from "antd";
import { WorkDocType } from "schema/enums";
import type { FhsRequestT } from "schema/fhs";
import type { UpPlaqueKmzT } from "schema/uploads";
import FormModal from "#/components/FormModal";
import CoordsInput from "#/components/inputs/CoordsInput";
import FileUpload from "#/components/inputs/FileUpload";
import LocalitySelect from "#/components/inputs/LocalitySelect";
import StaffSelect from "#/components/inputs/StaffSelect";
import type { ModalStateProps } from "#/hooks/useModalViewer";

export default function FhsRequestForm(props: ModalStateProps) {
  const [form] = Form.useForm<FhsRequestT>();
  const onSubmit = (data: unknown) => {
    message.success(
      <pre className="text-left">{JSON.stringify(data, null, 1)}</pre>,
    );
  };
  const onParse = (data: UpPlaqueKmzT) => {
    console.log("Set", data);
    form.setFieldsValue({
      coords: data.coords,
      localityId: data.localityId,
    });
  };

  return (
    <FormModal
      form={form}
      title="Demande d'etude FTTH"
      state={props.state}
      onSubmit={onSubmit}
      maskCloseable
    >
      <Form.Item
        name={WorkDocType.PLAQUE_KMZ}
        label="Fichier KMZ de la plaque"
        required
      >
        <FileUpload
          type={WorkDocType.PLAQUE_KMZ}
          onParsed={onParse}
          placeholder="Choisir un fichier KMZ ou KML"
        />
      </Form.Item>

      <Form.Item name="coords" label="Coordonnées" required>
        <CoordsInput />
      </Form.Item>

      <Form.Item name="localityId" label="Localité" required>
        <LocalitySelect />
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
