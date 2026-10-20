import { message } from "antd";
import { m } from "i18n/messages";
import type { FhsReviewT, FtthSurveyT } from "schema/fhs";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import FormFooter from "#/components/inputs/FormFooter";
import type { FhsFormProps } from "../fhs-types";

export default function FhsAcceptForm(props: FhsFormProps) {
  const submitM = useApiPost<FhsReviewT, FtthSurveyT>("/fhs/review");

  const onSubmit = apiCall(async (data: FhsReviewT) => {
    data.id = props.item.id;
    data.passed = true;
    const result = await submitM.mutateAsync(data);
    message.success(`${result.work.sid} approved`);
    props.state.close();
  });

  return (
    <FormModal
      title={m.fhs_form_accept()}
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
    >
      <FormFooter />
    </FormModal>
  );
}
