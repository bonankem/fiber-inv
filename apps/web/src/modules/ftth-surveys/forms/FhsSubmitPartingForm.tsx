import { Form, InputNumber } from "antd";
import { m } from "i18n/messages";
import { WorkDocType } from "schema/enums";
import { type FhsSubmitPartingT, ftthSurveyFullZ } from "schema/fhs";
import { useApiGet } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import WorkDocInput from "#/components/inputs/WorkDocInput";
import { req } from "#/utils/form";
import { type FhsFormProps, useFhsUpdate } from "../fhs-types";

export default function FhsSubmitPartingForm(props: FhsFormProps) {
  const up = useFhsUpdate<FhsSubmitPartingT>(
    "fhs/parting",
    props,
    m.toast_submitted,
  );
  const [form] = Form.useForm<FhsSubmitPartingT>();
  const full = useApiGet(["fhs", props.item.id], ftthSurveyFullZ);

  return (
    <FormModal
      {...up}
      form={form}
      width={320}
      title={m.fhs_submit_parting()}
      state={props.state}
      subtitle={props.item.work.name}
    >
      <WorkDocInput
        type={WorkDocType.FHS_PARTING_KMZ}
        label={m.parting_kmz()}
        old={full}
      />

      <Form.Item name="clusters" label={m.number_of_clusters()} {...req}>
        <InputNumber className="w-full!" min={0} required />
      </Form.Item>
    </FormModal>
  );
}
