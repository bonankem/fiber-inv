import { Form, message, Select, Space } from "antd";
import { m } from "i18n/messages";
import type { FhcConfigT, FtthConnectionT } from "schema/fhc";
import { oltZ } from "schema/network";
import { apiCall, useApiGet, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import IntInput from "#/components/inputs/IntInput";
import { req } from "#/utils/form";
import { selectProps } from "#/utils/select";
import type { FhcFormProps } from "../fhc-types";

export default function FhcConfigForm(props: FhcFormProps) {
  const oltsQ = useApiGet("/network/olts", oltZ.array());
  const sendM = useApiPost<FhcConfigT, FtthConnectionT>("/fhc/config");

  const onSubmit = apiCall(async (data: FhcConfigT) => {
    data.id = props.item.id;
    const result = await sendM.mutateAsync(data);
    message.success(m.toast_submitted({ id: result.work.sid }));
    props.state.close();
  });

  return (
    <FormModal
      width={400}
      title="Set Configuration"
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
      submitting={sendM.isPending}
    >
      <Form.Item name="oltId" label="OLT" {...req}>
        <Select loading={oltsQ.isLoading} {...selectProps(oltsQ.data)} />
      </Form.Item>

      <Space>
        <Form.Item name="oltSlot" label="OLT Slot" {...req}>
          <IntInput required min={1} max={18} controls={false} />
        </Form.Item>

        <Form.Item name="oltPort" label="OLT Port" {...req}>
          <IntInput required min={1} max={32} controls={false} />
        </Form.Item>
      </Space>
    </FormModal>
  );
}
