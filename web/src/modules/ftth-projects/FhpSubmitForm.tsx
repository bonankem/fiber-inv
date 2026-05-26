import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, message } from "antd";
import type { WorkDocType } from "schema/enums";
import type { FhpReportT, FtthProjectT } from "schema/fhp";
import { apiCall, postFn } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import FileUpload, { type Parsed } from "#/components/inputs/FileUpload";
import IntInput from "#/components/inputs/IntInput";
import { req } from "#/utils/form";
import type { FhpFormProps } from "./fhp-types";

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

const qtyInput = (name: keyof FhpReportT, label: string, length = false) => (
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
  const [form] = Form.useForm<FhpReportT>();

  const qc = useQueryClient();
  const submitM = useMutation({
    mutationFn: postFn<FhpReportT, FtthProjectT>("/fhp/submit"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fhp"] }),
  });

  const onSubmit = apiCall(async (data: FhpReportT) => {
    data.id = props.item.id;
    const result = await submitM.mutateAsync(data);
    message.success(`Submitted ${result.work.sid}`);
    props.state.close();
  });

  return (
    <FormModal
      form={form}
      title="Finish Project"
      width={360}
      state={props.state}
      subtitle={props.item.work.name}
      className="grid gap-4 grid-cols-1"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Quantités</h2>
        {qtyInput("xBoxes", "X Box")}
        {qtyInput("hubBoxes", "Hub Box")}
        {qtyInput("subBoxes", "Sub Box")}
        {qtyInput("endBoxes", "End Box")}
        {qtyInput("concretePoles", "Poteaux bétons")}
        {qtyInput("metalPoles", "Poteaux métalliques")}
        {qtyInput("closures", "Closures")}
        {qtyInput("manholes", "Chambres")}
        {qtyInput("feederLengthM", "Câbles transport", true)}
        {qtyInput("distLengthM", "Câbles distribution", true)}

        <h2 className="font-medium">Fichiers</h2>
        {fileInput("AS_BUILT_KMZ", "As-Built KMZ")}
        {fileInput("AS_BUILT_BOQ", "As-Built  BOQ")}
      </div>
    </FormModal>
  );
}
