import { Form, message } from "antd";
import { m } from "i18n/messages";
import { countBy } from "remeda";
import { WorkDocType } from "schema/enums";
import type { FhpSubmitT, FtthProjectT } from "schema/fhp";
import type { UpFhsBoxT, UpOdnKmzT } from "schema/uploads";
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

const qtyInput = (name: keyof FhpSubmitT, label: string, length = false) => (
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
  const [form] = Form.useForm<FhpSubmitT>();

  const send = useApiPost<FhpSubmitT, FtthProjectT>("/fhp/submit");

  const onSubmit = apiCall(async (data: FhpSubmitT) => {
    data.id = props.item.id;
    const result = await send.mutateAsync(data);
    message.success(`Submitted ${result.work.sid}`);
    props.state.close();
  });

  const boxCounts = (boxes: UpFhsBoxT[]) => {
    const count = countBy(boxes, (b) => b.type ?? "");
    return {
      xBoxes: count.X,
      hubBoxes: count.HUB,
      fats: count.FAT,
    };
  };

  const onParseKmz = (up: UpOdnKmzT) => {
    form.setFieldsValue({
      ...boxCounts(up.boxes),
      metalPoles: up.metalPoles.length,
      concretePoles: up.concretePoles.length,
    });
  };

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
        {fileInput(WorkDocType.FHP_ODN_KMZ, "As-Built KMZ", onParseKmz)}

        <h2 className="font-medium">{m.quantities()}</h2>
        {qtyInput("xBoxes", m.field_x_boxes())}
        {qtyInput("hubBoxes", m.hub_boxes())}
        {qtyInput("fats", m.fat_pbo())}
        {qtyInput("concretePoles", m.concrete_poles())}
        {qtyInput("metalPoles", m.metal_poles())}
        {qtyInput("closures", m.closures())}
        {qtyInput("manholes", m.manholes())}
        {qtyInput("transportMetres", m.field_tran_cables(), true)}
        {qtyInput("distMetres", m.dist_cables(), true)}
      </div>
    </FormModal>
  );
}
