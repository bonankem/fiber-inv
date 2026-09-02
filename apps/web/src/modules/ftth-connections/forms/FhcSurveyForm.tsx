import { Form, Input, message, Select } from "antd";
import { m } from "i18n/messages";
import { WorkDocType, WorkStatus } from "schema/enums";
import type { FhcSurveyT, FtthConnectionT } from "schema/fhc";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import FileUpload from "#/components/inputs/FileUpload";
import { req } from "#/utils/form";
import { type FhcFormProps, fhcModeSelect, yesNoSelect } from "../fhc-types";

const { SURVEY_REPORT } = WorkDocType;
const nextPhases = [
  { value: WorkStatus.INSTALLATION, label: m.start_installation() },
  { value: WorkStatus.DESATURATION, label: m.pending_desaturation() },
  { value: WorkStatus.BUILDING_CABLING, label: m.pending_building_cabling() },
];

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
      <Form.Item name={SURVEY_REPORT} label={m.report()} {...req}>
        <FileUpload required type={SURVEY_REPORT} />
      </Form.Item>

      <Form.Item name="nextPhase" label={m.next_phase()} {...req}>
        <Select options={nextPhases} />
      </Form.Item>

      <div className="grid grid-cols-2 gap-2">
        <Form.Item name="mode" label={m.mode_of_cabling()} {...req}>
          <Select options={fhcModeSelect} />
        </Form.Item>

        <Form.Item name="withPole" label={m.with_pole()} {...req}>
          <Select options={yesNoSelect} />
        </Form.Item>
      </div>

      <Form.Item name="comment" label={m.comment()} required>
        <Input.TextArea rows={3} className="resize-none!" required />
      </Form.Item>
    </FormModal>
  );
}
