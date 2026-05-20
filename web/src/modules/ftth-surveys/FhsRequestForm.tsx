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

export default function FhsRequestForm(props: ModalStateProps) {
  const [form] = Form.useForm<FhsRequestT>();
  const qc = useQueryClient();

  const submitM = useMutation({
    mutationFn: postFn<FhsRequestT, FtthSurveyT>("/fhs"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fhs"] }),
  });

  const onParse = (data: UpPlaqueKmzT) => {
    console.log("Set", data);
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

      <Form.Item name="name" label="Nom de lieu" required>
        <Input required id="fhs-name" />
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
