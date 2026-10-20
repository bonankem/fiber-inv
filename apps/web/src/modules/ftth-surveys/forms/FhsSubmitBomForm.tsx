import { Form } from "antd";
import { m } from "i18n/messages";
import { WorkDocType } from "schema/enums";
import { type FhsSubmitBomT, ftthSurveyFullZ } from "schema/fhs";
import { useApiGet } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import FormFooter from "#/components/inputs/FormFooter";
import WorkDocInput from "#/components/inputs/WorkDocInput";
import { type FhsFormProps, useFhsUpdate } from "../fhs-types";

export default function FhsSubmitBomForm(props: FhsFormProps) {
  const up = useFhsUpdate<FhsSubmitBomT>("fhs/bom", props, m.toast_submitted);
  const [form] = Form.useForm<FhsSubmitBomT>();
  const full = useApiGet(["fhs", props.item.id], ftthSurveyFullZ);

  return (
    <FormModal
      {...up}
      form={form}
      width={320}
      title={m.fhs_submit_bom()}
      state={props.state}
      subtitle={props.item.work.name}
    >
      <WorkDocInput type={WorkDocType.FHS_BOM} label={m.bom()} old={full} />

      <FormFooter />
    </FormModal>
  );
}
