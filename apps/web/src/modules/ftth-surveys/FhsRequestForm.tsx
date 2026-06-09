import { Map as GoogleMap, Polygon, useMap } from "@vis.gl/react-google-maps";
import { Form, Input, message } from "antd";
import { m } from "i18n/messages";
import { useState } from "react";
import { WorkDocType } from "schema/enums";
import type { FhsRequestT, FtthSurveyT } from "schema/fhs";
import type { UpPlaqueKmzT } from "schema/uploads";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import CoordsInput from "#/components/inputs/CoordsInput";
import FileUpload from "#/components/inputs/FileUpload";
import LocalitySelect from "#/components/inputs/LocalitySelect";
import StaffSelect from "#/components/inputs/StaffSelect";
import type { ModalStateProps } from "#/hooks/useModalViewer";
import { useUploader } from "#/hooks/useUploader";
import { useAppTheme } from "#/theme";
import { req } from "#/utils/form";

const { PLAQUE_KMZ } = WorkDocType;

export default function FhsRequestForm(props: ModalStateProps) {
  const uploader = useUploader();
  const isUploading = uploader.isUploading(PLAQUE_KMZ);
  const placeholder = isUploading ? m.hint_reading_file() : undefined;
  const send = useApiPost<FhsRequestT, FtthSurveyT>("/fhs", ["fhs"]);

  const map = useMap();
  const { isDark } = useAppTheme();
  const [parsed, setParsed] = useState<UpPlaqueKmzT>();
  const [form] = Form.useForm<FhsRequestT>();

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
    const result = await send.mutateAsync(data);
    message.success(`Submitted ${result.work.sid}`);
    props.state.close();
  });

  return (
    <FormModal
      form={form}
      width={720}
      title={m.fhs_form_request()}
      state={props.state}
      onSubmit={onSubmit}
      submitting={send.isPending}
      className="grid sm:grid-cols-2 gap-2 sm:gap-6 *:flex *:flex-col *:gap-2"
    >
      <section>
        <Form.Item name={PLAQUE_KMZ} label={m.field_plaque_kmz()} required>
          <FileUpload
            required
            type={PLAQUE_KMZ}
            onParsed={onParse}
            placeholder={m.hint_choose_kmz()}
          />
        </Form.Item>

        <Form.Item name="coords" label={m.field_coords()} required>
          <CoordsInput placeholder={placeholder} required />
        </Form.Item>

        <div className="grow mt-2.5 min-h-64 rounded-lg overflow-hidden border">
          <GoogleMap
            defaultCenter={{ lat: 7.5, lng: -5.5 }}
            defaultZoom={5.5}
            disableDefaultUI
            keyboardShortcuts={false}
            colorScheme={isDark ? "DARK" : "LIGHT"}
            className="w-full h-full"
          >
            {parsed && (
              <Polygon
                paths={parsed.boundary}
                strokeColor="#ffcb05"
                fillColor="#ffcb05"
                fillOpacity={0.2}
                strokeOpacity={0.8}
              />
            )}
          </GoogleMap>
        </div>
      </section>

      <section>
        <Form.Item name="name" label={m.name()} required>
          <Input required id="fhs-name" placeholder={placeholder} />
        </Form.Item>

        <Form.Item name="localityId" label={m.locality()} {...req}>
          <LocalitySelect placeholder={placeholder} />
        </Form.Item>

        <Form.Item name="contact" label={m.client_contact()} required>
          <Input
            required
            id="fhs-contact"
            placeholder={m.hint_name_and_phone()}
          />
        </Form.Item>

        <Form.Item name="managerId" label={m.manager()} required>
          <StaffSelect filter="PLANNING_MANAGER" />
        </Form.Item>

        <Form.Item name="comment" label={m.field_comment()}>
          <Input.TextArea rows={4} className="resize-none!" />
        </Form.Item>
      </section>
    </FormModal>
  );
}
