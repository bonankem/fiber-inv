import { Form, Input, message, Select } from "antd";
import { m } from "i18n/messages";
import { WorkStatus } from "schema/enums";
import type { FhcStatusT, FtthConnectionT } from "schema/fhc";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import { req } from "#/utils/form";
import type { FhcFormProps } from "../fhc-types";

const nextPhases = [
  { value: WorkStatus.INSTALLATION, label: m.start_installation() },
  { value: WorkStatus.DESATURATION, label: m.pending_desaturation() },
  { value: WorkStatus.BUILDING_CABLING, label: m.pending_building_cabling() },
];

export default function FhcStatusForm(props: FhcFormProps) {
  const submitM = useApiPost<FhcStatusT, FtthConnectionT>("/fhc/status");
  const work = props.item.work;

  const onSubmit = apiCall(async (data: FhcStatusT) => {
    data.id = props.item.id;
    const result = await submitM.mutateAsync(data);
    message.success(m.toast_submitted({ id: result.work.sid }));
    props.state.close();
  });

  return (
    <FormModal
      width={320}
      title={m.finish_survey()}
      subtitle={work.name}
      state={props.state}
      onSubmit={onSubmit}
    >
      <Form.Item name="nextPhase" label={m.next_phase()} {...req}>
        <Select options={nextPhases.filter((p) => p.value !== work.status)} />
      </Form.Item>

      <Form.Item name="comment" label={m.comment()} required>
        <Input.TextArea rows={3} className="resize-none!" required />
      </Form.Item>
    </FormModal>
  );
}
