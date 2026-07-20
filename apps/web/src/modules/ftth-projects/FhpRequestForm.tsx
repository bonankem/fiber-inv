import { Form, Input, message, Select } from "antd";
import { m } from "i18n/messages";
import type { FhpRequestT, FtthProjectT } from "schema/fhp";
import { ftthSurveyBriefZ } from "schema/fhs";
import { type Maybe, zArray } from "schema/utils";
import { apiCall, useApiGet, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import CoordsInput from "#/components/inputs/CoordsInput";
import LocalitySelect from "#/components/inputs/LocalitySelect";
import StaffSelect from "#/components/inputs/StaffSelect";
import type { ModalStateProps } from "#/hooks/useModalViewer";
import { req } from "#/utils/form";

export default function FhpRequestForm(props: ModalStateProps) {
  const [form] = Form.useForm<FhpRequestT>();

  const surveysQ = useApiGet("/fhs/for-project", zArray(ftthSurveyBriefZ));

  const onSelectSurvey = (id: Maybe<string>) => {
    const s = id && surveysQ.data?.find((s) => s.id === id);
    if (!s) return;

    form.setFieldsValue({
      name: s.work.name,
      coords: s.work.coords || undefined,
      contact: s.contact || undefined,
      localityId: s.work.localityId || undefined,
    });
  };

  const send = useApiPost<FhpRequestT, FtthProjectT>("/fhp");

  const onSubmit = apiCall(async (data: FhpRequestT) => {
    const result = await send.mutateAsync(data);
    message.success(`${result.work.sid} requested`);
    props.state.close();
  });

  return (
    <FormModal
      form={form}
      title={m.fhp_form_request()}
      state={props.state}
      onSubmit={onSubmit}
      submitting={send.isPending}
    >
      <Form.Item name="surveyId" label={m.survey()} {...req}>
        <Select
          loading={surveysQ.isLoading}
          options={surveysQ.data?.map((s) => ({
            value: s.id,
            label: s.work.name,
          }))}
          showSearch={{ optionFilterProp: "label" }}
          onSelect={onSelectSurvey}
        />
      </Form.Item>

      <Form.Item name="coords" label={m.field_coords()} {...req}>
        <CoordsInput />
      </Form.Item>

      <Form.Item name="localityId" label={m.locality()} {...req}>
        <LocalitySelect />
      </Form.Item>

      <Form.Item name="name" label={m.name()} required>
        <Input required id="fhs-name" />
      </Form.Item>

      <Form.Item name="contact" label={m.client_contact()} required>
        <Input required id="fhs-contact" />
      </Form.Item>

      <Form.Item name="managerId" label={m.manager()} {...req}>
        <StaffSelect filter="PROJECT_MANAGER" />
      </Form.Item>

      <Form.Item name="comment" label={m.field_comment()}>
        <Input.TextArea rows={3} className="resize-none!" />
      </Form.Item>
    </FormModal>
  );
}
