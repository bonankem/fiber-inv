import { Form, message } from "antd";
import { m } from "i18n/messages";
import type { WorkDocType } from "schema/enums";
import type { FhpSendReportT, FtthProjectT } from "schema/fhp";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import FileUpload, { type Parsed } from "#/components/inputs/FileUpload";
import IntInput from "#/components/inputs/IntInput";
import { req } from "#/utils/form";
import type { FhpFormProps } from "../fhp-types";

const fileInput = <T extends WorkDocType & string>(
  type: T,
  label: string,
  onParsed?: (p: Parsed<T>) => void,
) => (
  <Form.Item name={type as string} layout="horizontal" {...req}>
    <FileUpload
      required
      type={type}
      placeholder={label}
      onParsed={onParsed}
      inputClassName="placeholder:text-gray-400!"
    />
  </Form.Item>
);

const qtyInput = (
  name: keyof FhpSendReportT,
  label: string,
  length = false,
) => (
  <Form.Item
    name={name}
    label={label}
    layout="horizontal"
    labelAlign="left"
    labelCol={{ span: 12 }}
  >
    <IntInput
      required
      className="w-full!"
      placeholder={length ? "Longueur" : undefined}
      suffix={length ? "m" : undefined}
      controls={false}
    />
  </Form.Item>
);

export default function FhpSubmitForm(props: FhpFormProps) {
  const [form] = Form.useForm<FhpSendReportT>();

  const send = useApiPost<FhpSendReportT, FtthProjectT>("/fhp/submit", ["fhp"]);

  const onSubmit = apiCall(async (data: FhpSendReportT) => {
    data.id = props.item.id;
    const result = await send.mutateAsync(data);
    message.success(`Submitted ${result.work.sid}`);
    props.state.close();
  });

  return (
    <FormModal
      form={form}
      title={m.fhp_form_finish()}
      width={360}
      state={props.state}
      subtitle={props.item.work.name}
      className="grid gap-4 grid-cols-1"
      onSubmit={onSubmit}
      submitting={send.isPending}
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-medium">{m.files()}</h2>
        {fileInput("AS_BUILT_KMZ", "As-Built KMZ")}
        {fileInput("AS_BUILT_BOQ", "As-Built BOQ")}

        <h2 className="font-medium">{m.quantities()}</h2>
        {qtyInput("xBoxes", m.field_x_boxes())}
        {qtyInput("hubBoxes", m.field_hub_boxes())}
        {qtyInput("subBoxes", m.field_sub_boxes())}
        {qtyInput("endBoxes", m.field_end_boxes())}
        {qtyInput("concretePoles", m.field_concrete_poles())}
        {qtyInput("metalPoles", m.field_metal_poles())}
        {qtyInput("closures", m.field_closures())}
        {qtyInput("manholes", m.field_manholes())}
        {qtyInput("transportMetres", m.field_tran_cables(), true)}
        {qtyInput("distMetres", m.field_dist_cables(), true)}
      </div>
    </FormModal>
  );
}
