import { Form, InputNumber } from "antd";
import { m } from "i18n/messages";
import { WorkDocType } from "schema/db";
import { type FhsSubmitTallyT, ftthSurveyFullZ } from "schema/fhs";
import { useApiGet } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import WorkDocInput from "#/components/inputs/WorkDocInput";
import { req } from "#/utils/form";
import { type FhsFormProps, useFhsUpdate } from "../fhs-types";

export default function FhsSubmitTallyForm(props: FhsFormProps) {
  const up = useFhsUpdate<FhsSubmitTallyT>(
    "fhs/tallying",
    props,
    m.toast_submitted,
  );
  const [form] = Form.useForm<FhsSubmitTallyT>();
  const full = useApiGet(["fhs", props.item.id], ftthSurveyFullZ);

  return (
    <FormModal
      {...up}
      form={form}
      width={320}
      title={m.fhs_submit_tally()}
      state={props.state}
      subtitle={props.item.work.name}
    >
      <WorkDocInput
        type={WorkDocType.FHS_TALLY_KMZ}
        label={m.fhs_tally_kmz()}
        old={full}
      />
      <WorkDocInput
        type={WorkDocType.FHS_TALLY_TABLE}
        label={m.fhs_tally_excel()}
        old={full}
      />

      <Form.Item name="hp" label={m.total_hp()} {...req}>
        <InputNumber className="w-full!" min={0} required />
      </Form.Item>
    </FormModal>
  );
}
