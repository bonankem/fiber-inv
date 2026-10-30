import { Form, Input, message } from "antd";
import type { EmrfAssignToT } from "schema/inventory";
import { apiCall } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import type { ModalItemProps } from "#/hooks/useModalViewer";
import { useAssignToEmrf } from "#/modules/hooks/inventory";
import { type EmrfRow, emrfJobName, emrfVendor } from "../emrf-utils";
import EmrfSummary from "./EmrfSummary";

export default function EmrfAssignToForm(props: ModalItemProps<EmrfRow>) {
  const assign = useAssignToEmrf();

  const onSubmit = apiCall(
    async ({ orderNumber }: Pick<EmrfAssignToT, "orderNumber">) => {
      await assign.mutateAsync({ id: props.item.id, orderNumber });
      message.success(`TO ${orderNumber} assigned`);
      props.state.close();
    },
  );

  return (
    <FormModal<Pick<EmrfAssignToT, "orderNumber">>
      title="Assign TO number"
      subtitle={emrfJobName(props.item)}
      state={props.state}
      width={480}
      okText="Assign TO number"
      checkbox="I have verified this TO number"
      submitting={assign.isPending}
      onSubmit={onSubmit}
    >
      <EmrfSummary emrf={props.item} />
      {emrfVendor(props.item) && (
        <p className="m-0 text-xs opacity-70">Vendor: {emrfVendor(props.item)}</p>
      )}
      <Form.Item<Pick<EmrfAssignToT, "orderNumber">>
        label="TO number"
        name="orderNumber"
        rules={[
          { required: true, whitespace: true, message: "Enter the TO number" },
        ]}
      >
        <Input
          autoComplete="off"
          maxLength={100}
          placeholder="Enter TO number"
        />
      </Form.Item>
      <p className="m-0 text-xs opacity-60">
        Assigning the TO number moves this EMRF to Ordered and makes the vendor
        collection form available.
      </p>
    </FormModal>
  );
}
