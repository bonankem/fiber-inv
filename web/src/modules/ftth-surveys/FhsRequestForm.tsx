import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Map as GoogleMap, Polygon, useMap } from "@vis.gl/react-google-maps";
import { Form, Input, message } from "antd";
import { useState } from "react";
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
import { useAppTheme } from "#/theme";

const { PLAQUE_KMZ } = WorkDocType;

export default function FhsRequestForm(props: ModalStateProps) {
  const [form] = Form.useForm<FhsRequestT>();
  const uploader = useUploader();
  const isUploading = uploader.isUploading(PLAQUE_KMZ);
  const placeholder = isUploading ? "Lecture du fichier..." : undefined;
  const [parsed, setParsed] = useState<UpPlaqueKmzT>();
  const map = useMap();
  const { isDark } = useAppTheme();

  const qc = useQueryClient();
  const submitM = useMutation({
    mutationFn: postFn<FhsRequestT, FtthSurveyT>("/fhs"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fhs"] }),
  });

  const onParse = (data: UpPlaqueKmzT) => {
    setParsed(data);
    map?.fitBounds(data.bbox, 50);

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
      width={720}
      title="Demande d'etude FTTH"
      state={props.state}
      onSubmit={onSubmit}
      submitting={submitM.isPending}
      className="grid sm:grid-cols-2 gap-2 sm:gap-6 *:flex *:flex-col *:gap-2"
    >
      <section>
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

        <GoogleMap
          defaultCenter={{ lat: 7.5, lng: -5.5 }}
          defaultZoom={5.5}
          disableDefaultUI
          keyboardShortcuts={false}
          colorScheme={isDark ? "DARK" : "LIGHT"}
          className="w-full min-h-64 grow rounded-md overflow-hidden mt-3 border"
        >
          {parsed && (
            <Polygon
              paths={parsed.boundary.map(({ lat, lon }) => ({ lat, lng: lon }))}
              strokeColor="#ffcb05"
              fillColor="#ffcb05"
              fillOpacity={0.2}
              strokeOpacity={0.8}
            />
          )}
        </GoogleMap>
      </section>

      <section>
        <Form.Item name="name" label="Nom" required>
          <Input required id="fhs-name" placeholder={placeholder} />
        </Form.Item>

        <Form.Item name="localityId" label="Localité" required>
          <LocalitySelect placeholder={placeholder} />
        </Form.Item>

        <Form.Item name="contact" label="Contact client" required>
          <Input required id="fhs-contact" placeholder="Nom et téléphone" />
        </Form.Item>

        <Form.Item name="managerId" label="Responsable" required>
          <StaffSelect filter="PLANNING_MANAGER" />
        </Form.Item>

        <Form.Item name="comment" label="Commentaire">
          <Input.TextArea rows={4} className="resize-none!" />
        </Form.Item>
      </section>
    </FormModal>
  );
}
