import { Form, InputNumber } from "antd";
import { m } from "i18n/messages";
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
      title={m.fhs_submit_tally()}
      state={props.state}
      subtitle={props.item.work.name}
    >
      <WorkDocInput type="FHS_TALLY_KMZ" label="KMZ" old={full} />
      <WorkDocInput type="FHS_TALLY_TABLE" label="Table" old={full} />

      <Form.Item name="hp" label={m.hp()} {...req}>
        <InputNumber className="w-full!" min={0} required />
      </Form.Item>
    </FormModal>
  );
}
