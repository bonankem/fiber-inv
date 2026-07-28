import { Form, Input, message } from "antd";
import { m } from "i18n/messages";
import { WorkDocType } from "schema/enums";
import type { FhcSurveyT, FtthConnectionT } from "schema/fhc";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import FileUpload from "#/components/inputs/FileUpload";
import { req } from "#/utils/form";
import type { FhcFormProps } from "../fhc-types";

export default function FhcSurveyForm(props: FhcFormProps) {
  const submitM = useApiPost<FhcSurveyT, FtthConnectionT>("/fhc/survey");

  const onSubmit = apiCall(async (data: FhcSurveyT) => {
    data.id = props.item.id;
    const result = await submitM.mutateAsync(data);
    message.success(m.toast_submitted({ id: result.work.sid }));
    props.state.close();
  });

  return (
    <FormModal
      title={m.finish_survey()}
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
    >
      <Form.Item name={WorkDocType.SURVEY_REPORT} label={m.report()} {...req}>
        <FileUpload required type="SURVEY_REPORT" />
      </Form.Item>

      <Form.Item name="comment" label={m.field_comment()} required>
        <Input.TextArea rows={3} className="resize-none!" required />
      </Form.Item>
    </FormModal>
  );
}
