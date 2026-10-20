import { Form } from "antd";
import { m } from "i18n/messages";
import { useState } from "react";
import { countBy } from "remeda";
import { WorkDocType as Doc } from "schema/enums";
import { type FhsSubmitSizingT, ftthSurveyFullZ } from "schema/fhs";
import type { UpFhsBoxT, UpFhsCoordsT, UpOdnKmzT } from "schema/uploads";
import { assoc } from "schema/utils";
import { useApiGet } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import type { Parsed } from "#/components/inputs/FileUpload";
import FormFooter from "#/components/inputs/FormFooter";
import IntInput from "#/components/inputs/IntInput";
import WorkDocInput from "#/components/inputs/WorkDocInput";
import useOnceReady from "#/hooks/useOnceReady";
import { type FhsFormProps, useFhsUpdate } from "../fhs-types";

type Dto = FhsSubmitSizingT;

export default function FhsSubmitSizingForm(props: FhsFormProps) {
  const up = useFhsUpdate<Dto>("fhs/sizing", props, m.toast_submitted);
  const full = useApiGet(["fhs", props.item.id], ftthSurveyFullZ);
  const [form] = Form.useForm<Dto>();
  const [_coords, setCoords] = useState<UpFhsCoordsT>();
  const [_kmz, setKmz] = useState<UpOdnKmzT>();

  useOnceReady(full.data, (full) => {
    const docs = assoc(
      full.work.docs,
      (d) => d.type,
      (d) => d.upload,
    );

    const kmz = docs[Doc.FHS_SIZING_KMZ];
    const coords = docs[Doc.FHS_COORDINATES];
    setKmz(kmz?.parsed as UpOdnKmzT);
    setCoords(coords?.parsed as UpFhsCoordsT);

    const qty = full.quantity;
    if (qty) {
      form.setFieldsValue({
        xBoxes: qty.xBoxes,
        hubBoxes: qty.hubBoxes,
        fats: qty.fats,
        manholes: qty.manholes,
        closures: qty.closures,
        metalPoles: qty.metalPoles,
        concretePoles: qty.concretePoles,
        transportLength: qty.transportLength,
        distLength: qty.distLength,
      });
    } else {
      console.log("No report");
    }
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
    setKmz(up);
  };

  const onParseCoords = (up: UpFhsCoordsT) => {
    form.setFieldsValue(boxCounts(up.boxes));
    setCoords(up);
  };

  const docInput = <T extends Doc & keyof Dto>(
    type: T,
    label: string,
    onParsed?: (p: Parsed<T>) => void,
  ) => (
    <WorkDocInput type={type} label={label} old={full} onParsed={onParsed} />
  );

  const qtyInput = (
    name: keyof FhsSubmitSizingT,
    label: string,
    length = false,
  ) => (
    <Form.Item name={name} label={label} rules={[{ required: true }]}>
      <IntInput
        required
        className="w-full! text-sm! h-8!"
        placeholder={length ? m.length() : undefined}
        suffix={length ? "m" : undefined}
        controls={false}
      />
    </Form.Item>
  );

  return (
    <FormModal
      {...up}
      form={form}
      width={720}
      title={m.fhs_submit_sizing()}
      state={props.state}
      subtitle={props.item.work.name}
      className="grid grid-cols-[2fr_3fr] gap-x-4 items-start"
    >
      <div>
        <h3 className="font-bold mb-2">{m.files()}</h3>
        {docInput(Doc.FHS_SIZING_KMZ, m.sizing_kmz(), onParseKmz)}
        {docInput(Doc.FHS_COORDINATES, m.coords(), onParseCoords)}
        {docInput(Doc.FHS_CABLE_LENGTHS, m.cable_lengths())}
        {docInput(Doc.FHS_SYNOPTIC_TABLE, m.field_synoptic_table())}
        {docInput(Doc.FHS_SYNOPTIC_DIAGRAM, m.field_synoptic_diag())}
        {docInput(Doc.FHS_PLAN_DIAGRAM, m.plan_diag())}
      </div>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <h3 className="font-bold mb-2 col-span-full">{m.quantities()}</h3>
        {qtyInput("fats", m.fat_pbo())}
        {qtyInput("hubBoxes", m.hub_boxes())}
        {qtyInput("xBoxes", m.field_x_boxes())}
        {qtyInput("closures", m.closures())}
        {qtyInput("transportLength", m.field_tran_cables(), true)}
        {qtyInput("distLength", m.dist_cables(), true)}
        {qtyInput("concretePoles", m.concrete_poles())}
        {qtyInput("metalPoles", m.metal_poles())}
        {qtyInput("manholes", m.manholes())}

        <FormFooter comment={{ rows: 1 }} />
      </div>
    </FormModal>
  );
}
