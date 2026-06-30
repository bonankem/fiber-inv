import { Form, Input, message, Select } from "antd";
import { m } from "i18n/messages";
import { BoxType, WorkDocType as Doc } from "schema/enums";
import type { FhcSubmitT, FtthConnectionT } from "schema/fhc";
import { boxZ } from "schema/network";
import { zArray } from "schema/utils";
import { apiCall, useApiGet, useApiPost } from "#/api/helpers";
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

export default function FhcSubmitForm({ item, state }: FhcFormProps) {
  const boxes = useApiGet("/network/boxes", zArray(boxZ));

  const send = useApiPost<FhcSubmitT, FtthConnectionT>("/fhc/submit", ["fhp"]);

  const onSubmit = apiCall(async (data: FhcSubmitT) => {
    data.id = item.id;
    const result = await send.mutateAsync(data);
    message.success(`Submitted ${result.work.sid}`);
    state.close();
  });

  return (
    <FormModal
      state={state}
      width={560}
      title={m.fhc_form_finish()}
      subtitle={`${item.tn}: ${item.work.name}`}
      className="grid md:grid-cols-2 gap-x-2"
      onSubmit={onSubmit}
    >
      {img(Doc.FHC_FAT, "FAT")}
      {img(Doc.FHC_DROP_CABLE, "Drop Cable Label")}
      {img(Doc.FHC_FAT_POWER_TEST, "FAT Power Test")}
      {img(Doc.FHC_ATB_POWER_TEST, "ATB Power Test")}
      {img(Doc.FHC_ONT_INDICATORS, "ONT Indicators")}
      {img(Doc.FHC_ONT_NAMEPLATE, "ONT Nameplate")}
      {img(Doc.FHC_SPEED_TEST, "Speed Test")}

      <Form.Item label="Cable Length">
        <IntInput suffix="m" controls={false} />
      </Form.Item>

      <Form.Item label="FAT">
        <Select
          showSearch={{ optionFilterProp: "label" }}
          options={boxes.data
            ?.filter((p) => p.type !== BoxType.HUB)
            ?.map((o) => ({ value: o.id, label: o.name }))}
        />
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
