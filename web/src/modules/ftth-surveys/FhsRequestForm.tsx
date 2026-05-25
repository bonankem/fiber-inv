import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Input, message } from "antd";
import { WorkDocType } from "schema/enums";
import type { FhsRequestT, FtthSurveyT } from "schema/fhs";
import type { UpPlaqueKmzT } from "schema/uploads";
import { apiCall, postFn } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import CoordsInput from "#/components/inputs/CoordsInput";
import FileUpload from "#/components/inputs/FileUpload";
import LocalitySelect from "#/components/inputs/LocalitySelect";
import StaffSelect from "#/components/inputs/StaffSelect";
import type { ModalStateProps } from "#/hooks/useModalViewer";
import { useUploader } from "#/hooks/useUploader";

const { PLAQUE_KMZ } = WorkDocType;

export default function FhsRequestForm(props: ModalStateProps) {
  const [form] = Form.useForm<FhsRequestT>();
  const uploader = useUploader();
  const isUploading = uploader.isUploading(PLAQUE_KMZ);
  const placeholder = isUploading ? "Lecture du fichier..." : undefined;

  const qc = useQueryClient();
  const submitM = useMutation({
    mutationFn: postFn<FhsRequestT, FtthSurveyT>("/fhs"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fhs"] }),
  });

  const onParse = (data: UpPlaqueKmzT) => {
    form.setFieldsValue({
      coords: data.coords,
      localityId: data.localityId,
      name: data.name,
      contact: undefined,
    });
    const toFocus = data.name ? "fhs-contact" : "fhs-name";
    document.getElementById(toFocus)?.focus();
  };

  const onSubmit = apiCall(async (data: FhsRequestT) => {
    const result = await submitM.mutateAsync(data);
    message.success(`Submitted ${result.work.sid}`);
    props.state.close();
  });

  return (
    <FormModal
      form={form}
      title="Demande d'etude FTTH"
      state={props.state}
      onSubmit={onSubmit}
      submitting={submitM.isPending}
    >
      <Form.Item name={PLAQUE_KMZ} label="Fichier KMZ de la plaque" required>
        <FileUpload
          type={PLAQUE_KMZ}
          onParsed={onParse}
          placeholder="Choisir un fichier KMZ ou KML"
        />
      </Form.Item>

      <Form.Item name="coords" label="Coordonnées" required>
        <CoordsInput placeholder={placeholder} />
      </Form.Item>

      <Form.Item name="localityId" label="Localité" required>
        <LocalitySelect placeholder={placeholder || "Département ou ville"} />
      </Form.Item>

      <Form.Item name="name" label="Nom du lieu" required>
        <Input required id="fhs-name" placeholder={placeholder} />
      </Form.Item>

      <Form.Item name="contact" label="Contact local" required>
        <Input required id="fhs-contact" placeholder="Nom et téléphone" />
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
