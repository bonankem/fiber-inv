import { Alert, message } from "antd";
import { apiCall } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import type { ModalItemProps } from "#/hooks/useModalViewer";
import { useApproveEmrf } from "#/modules/hooks/inventory";
import { type EmrfRow, emrfJobName, emrfShortLines } from "../emrf-utils";
import EmrfSummary from "./EmrfSummary";

export default function EmrfApproveForm(props: ModalItemProps<EmrfRow>) {
  const approve = useApproveEmrf();
  const short = emrfShortLines(props.item).length;

  const onSubmit = apiCall(async () => {
    await approve.mutateAsync({ id: props.item.id ,uploads: [],});
    message.success("EMRF approved");
    props.state.close();
  });

  return (
    <FormModal
      title="Approve EMRF"
      subtitle={emrfJobName(props.item)}
      state={props.state}
      width={480}
      okText="Approve"
      checkbox="I have checked the items and quantities"
      submitting={approve.isPending}
      onSubmit={onSubmit}
    >
      <EmrfSummary emrf={props.item} />
      {short > 0 && (
        <Alert
          showIcon
          type="warning"
          message={`${short} ${short === 1 ? "item needs" : "items need"} more than the available stock.`}
        />
      )}
      <p className="m-0 text-xs opacity-60">
        Your name and the time are recorded as the approval.
      </p>
    </FormModal>
  );
}
