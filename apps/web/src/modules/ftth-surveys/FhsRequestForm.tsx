import { Map as GoogleMap, Polygon, useMap } from "@vis.gl/react-google-maps";
import { AutoComplete, Checkbox, Form, Input, message } from "antd";
import { m } from "i18n/messages";
import { useState } from "react";
import { WorkDocType } from "schema/enums";
import { type FhsRequestT, type FtthSurveyT, fhsCodesZ } from "schema/fhs";
import type { UpPlaqueKmzT } from "schema/uploads";
import { apiCall, useApiGet, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import CoordsInput from "#/components/inputs/CoordsInput";
import FileUpload from "#/components/inputs/FileUpload";
import LocalitySelect from "#/components/inputs/LocalitySelect";
import StaffSelect from "#/components/inputs/StaffSelect";
import type { ModalStateProps } from "#/hooks/useModalViewer";
import { useUploader } from "#/hooks/useUploader";
import { useAppTheme } from "#/theme";
import { req } from "#/utils/form";

const { FHS_AREA_KMZ } = WorkDocType;
const validCode = /^[A-Z]{4,5}\d?$/;

export default function FhsRequestForm(props: ModalStateProps) {
  const uploader = useUploader();
  const isUploading = uploader.isUploading(FHS_AREA_KMZ);
  const placeholder = isUploading ? m.hint_reading_file() : undefined;
  const send = useApiPost<FhsRequestT, FtthSurveyT>("/fhs");
  const [form] = Form.useForm<FhsRequestT>();

  const codesQ = useApiGet("/fhs/codes", fhsCodesZ);
  const [codes, setCodes] = useState<{ value: string }[]>([]);

  const searchCode = (code: string) => {
    console.log("searchCode", code);
    const all = codesQ.data?.map((c) => c.code);
    if (!all?.length) return setCodes([]);

    code = code.trim().toUpperCase();
    if (!code) return setCodes([]);

    const result = all.filter((c) => c.startsWith(code));
    if (validCode.test(code) && !result.includes(code)) {
      result.push(code);
    }
    setCodes(result.map((c) => ({ value: c })));
  };

  const map = useMap();
  const { isDark } = useAppTheme();
  const [parsed, setParsed] = useState<UpPlaqueKmzT>();

  const onParse = (data: UpPlaqueKmzT) => {
    setParsed(data);
    map?.fitBounds(data.bbox, 10);

    form.setFieldsValue({
      name: data.name,
      coords: data.coords,
      localityId: data.localityId,
      area: undefined,
    });
    const toFocus = data.name ? "fhs-type" : "fhs-name";
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
      width={600}
      title={m.fhs_form_request()}
      state={props.state}
      onSubmit={onSubmit}
      submitting={send.isPending}
      className="grid sm:grid-cols-2 gap-2 *:flex *:flex-col *:gap-2"
      checkbox={false}
    >
      <section>
        <Form.Item name={FHS_AREA_KMZ} label={m.area_kmz()} required>
          <FileUpload
            required
            type={FHS_AREA_KMZ}
            onParsed={onParse}
            placeholder={m.hint_choose_kmz()}
          />
        </Form.Item>

        <Form.Item name="localityId" label={m.locality()} {...req}>
          <LocalitySelect placeholder={placeholder} />
        </Form.Item>

        <Form.Item name="coords" label={m.coords()} required>
          <CoordsInput placeholder={placeholder} required />
        </Form.Item>

        <div className="grow mt-2.5 min-h-48 rounded-lg overflow-hidden border">
          <GoogleMap
            defaultCenter={{ lat: 7.5, lng: -5.5 }}
            defaultZoom={5}
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

        <Form.Item
          name="area"
          label={m.area_code()}
          validateTrigger="onBlur"
          rules={[{ pattern: validCode, message: m.area_code_hint() }]}
        >
          <AutoComplete
            id="fhs-type"
            options={codes}
            onChange={searchCode}
            showSearch={{ onSearch: searchCode }}
          >
            <Input
              required
              autoComplete="off"
              pattern={validCode.source}
              title={m.area_code_hint()}
              placeholder={m.area_code_hint()}
            />
          </AutoComplete>
        </Form.Item>

        <Form.Item name="managerId" label={m.manager()} required>
          <StaffSelect filter="PLANNING_MANAGER" />
        </Form.Item>

        <Form.Item name="comment" label={m.comment()}>
          <Input.TextArea rows={6} className="resize-none!" />
        </Form.Item>

        <section className="mt-2 -mb-1">
          <Checkbox required>{m.check_confirm()}</Checkbox>
        </section>
      </section>
    </FormModal>
  );
}
