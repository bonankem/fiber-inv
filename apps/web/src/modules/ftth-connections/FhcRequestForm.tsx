import { Form, Input, message } from "antd";
import { m } from "i18n/messages";
import type { FhcRequestT, FtthConnectionT } from "schema/fhc";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import CoordsInput from "#/components/inputs/CoordsInput";
import LocalitySelect from "#/components/inputs/LocalitySelect";
import VendorSelect from "#/components/inputs/VendorSelect";
import type { ModalStateProps } from "#/hooks/useModalViewer";
import { req } from "#/utils/form";

export default function FhcRequestForm(props: ModalStateProps) {
  const send = useApiPost<FhcRequestT, FtthConnectionT>("/fhc");

  const onSubmit = apiCall(async (data: FhcRequestT) => {
    const result = await send.mutateAsync(data);
    message.success(`${result.work.sid} requested`);
    props.state.close();
  });

  return (
    <FormModal
      title={m.fhc_form_request()}
      width={480}
      state={props.state}
      onSubmit={onSubmit}
      submitting={send.isPending}
      className="grid md:grid-cols-2 gap-x-4"
    >
      <Form.Item
        name="name"
        label={m.name()}
        required
        className="col-span-full"
      >
        <Input required id="fhs-name" />
      </Form.Item>

      <Form.Item name="tn" label="TN" required>
        <Input required />
      </Form.Item>

      <Form.Item name="vendorId" label={m.field_vendor()} required>
        <VendorSelect />
      </Form.Item>

      <Form.Item name="localityId" label={m.locality()} {...req}>
        <LocalitySelect />
      </Form.Item>

      <Form.Item name="coords" label={m.coords()} {...req}>
        <CoordsInput />
      </Form.Item>

      <Form.Item name="phone" label={m.phone()}>
        <Input type="phone" />
      </Form.Item>

      <Form.Item name="email" label={m.email()}>
        <Input type="email" />
      </Form.Item>

      <Form.Item name="comment" label={m.comment()} className="col-span-full">
        <Input.TextArea rows={3} className="resize-none!" />
      </Form.Item>
    </FormModal>
  );
}
