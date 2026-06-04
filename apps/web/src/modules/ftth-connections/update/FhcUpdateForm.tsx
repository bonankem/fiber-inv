import { Form, Input, Select } from "antd";
import { WorkDocType as Doc } from "schema/enums";
import FormModal from "#/components/FormModal";
import FileUpload from "#/components/inputs/FileUpload";
import IntInput from "#/components/inputs/IntInput";
import type { FhcFormProps } from "../fhc-types";

function img(type: Doc & `FHC_${string}`, label: string) {
  return (
    <Form.Item name={["images", type]} label={label}>
      <FileUpload type={Doc.FHC_FAT} placeholder="Image" accept="image/*" />
    </Form.Item>
  );
}

export default function FhcUpdateForm({ item, state }: FhcFormProps) {
  return (
    <FormModal
      state={state}
      width={560}
      title="Progress Update"
      subtitle={`${item.fn}: ${item.work.name}`}
      className="grid md:grid-cols-2 gap-x-2"
    >
      {img(Doc.FHC_FAT, "FAT")}
      {img(Doc.FHC_DROP_CABLE_LABEL, "Drop Cable Label")}
      {img(Doc.FHC_FAT_POWER_TEST, "FAT Power Test")}
      {img(Doc.FHC_ATB_POWER_TEST, "ATB Power Test")}
      {img(Doc.FHC_ONT_INDICATORS, "ONT Indicators")}
      {img(Doc.FHC_ONT_NAMEPLATE, "ONT Nameplate")}
      {img(Doc.FHC_SPEED_TEST, "Speed Test")}

      <Form.Item label="Cable Length">
        <IntInput suffix="m" controls={false} />
      </Form.Item>

      <Form.Item label="FAT">
        <Select />
      </Form.Item>

      <Form.Item label="FAT Port">
        <IntInput controls={false} min={1} max={8} />
      </Form.Item>

      <Form.Item label="ONT Serial Number">
        <Input />
      </Form.Item>

      <Form.Item label="ONT Model">
        <Input />
      </Form.Item>
    </FormModal>
  );
}
