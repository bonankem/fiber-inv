import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Grid, message } from "antd";
import { countBy, filter, pipe, sumBy } from "remeda";
import { BoxType, type WorkDocType } from "schema/enums";
import type { FhsSubmitT, FtthSurveyT } from "schema/fhs";
import type { UpFhsCoordsT, UpPlanKmzT } from "schema/uploads";
import { apiCall, postFn } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import FileUpload, { type Parsed } from "#/components/inputs/FileUpload";
import IntInput from "#/components/inputs/IntInput";
import { req } from "#/utils/form";
import type { FhsFormProps } from "../fhs-types";

const fileInput = <T extends WorkDocType & string>(
  type: T,
  label: string,
  onParsed?: (p: Parsed<T>) => void,
) => (
  <Form.Item name={type as string} {...req}>
    <FileUpload
      required
      type={type}
      placeholder={label}
      onParsed={onParsed}
      inputClassName="placeholder:text-gray-400!"
    />
  </Form.Item>
);

const qtyInput = (name: keyof FhsSubmitT, label: string, length = false) => (
  <Form.Item name={name} noStyle>
    <IntInput
      required
      className="w-full!"
      addonBefore={<div className="one-line w-32">{label}</div>}
      placeholder={length ? "Longueur" : undefined}
      suffix={length ? "m" : undefined}
      controls={false}
    />
  </Form.Item>
);

export default function FhsSubmitForm(props: FhsFormProps) {
  const [form] = Form.useForm<FhsSubmitT>();
  const mobile = !Grid.useBreakpoint().md;

  const qc = useQueryClient();
  const submitM = useMutation({
    mutationFn: postFn<FhsSubmitT, FtthSurveyT>("/fhs/submit"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fhs"] }),
  });

  const onSubmit = apiCall(async (data: FhsSubmitT) => {
    data.id = props.item.id;
    const result = await submitM.mutateAsync(data);
    message.success(`Submitted ${result.work.sid}`);
    props.state.close();
  });

  const onParseKmz = (up: UpPlanKmzT) => {
    const old = form.getFieldsValue();
    form.setFieldsValue({
      metalPoles: up.metalPoles.length || old.metalPoles,
      concretePoles: up.concretePoles.length || old.concretePoles,
    });
  };

  const onParseCoords = (up: UpFhsCoordsT) => {
    type MaybeBox = (typeof up)["boxes"][number];
    type Box = MaybeBox & { type: NonNullable<BoxType> };

    const fats: BoxType[] = [BoxType.SUB_BOX, BoxType.END_BOX];
    const boxes = up.boxes.filter((b) => b.type) as Box[];
    const count = countBy(boxes, (b) => b.type);
    const hp = pipe(
      boxes,
      filter((b) => fats.includes(b.type)),
      sumBy((b) => b.hp || 0),
    );
    form.setFieldsValue({
      hp,
      xBoxes: count.X_BOX,
      hubBoxes: count.HUB_BOX,
      subBoxes: count.SUB_BOX,
      endBoxes: count.END_BOX,
      oltCards: Math.ceil(hp / 512),
    });
  };

  return (
    <FormModal
      form={form}
      title="Submit Survey Report"
      width={mobile ? 480 : 640}
      state={props.state}
      subtitle={props.item.work.name}
      className="grid gap-4 grid-cols-1 md:grid-cols-2"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Fichiers</h2>

        {fileInput("PLAN_KMZ", "KMZ", onParseKmz)}
        {fileInput("PLAN_BOQ", "BOQ")}
        {fileInput("COORDINATES", "Coordonnées", onParseCoords)}
        {fileInput("PLAN_DIAGRAM", "Plan (DWG)")}
        {fileInput("SYNOPTIC_DIAGRAM", "Synoptique (DWG)")}
        {fileInput("SYNOPTIC_TABLE", "Tableau Synoptique")}
        {fileInput("CABLE_LENGTHS", "Longueurs des câbles")}
        {fileInput("HP_SUMMARY", "Récapitulatif des ELs")}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Nouvelles quantités</h2>

        {qtyInput("hp", "HP")}
        {qtyInput("oltCards", "Cartes OLT")}
        {qtyInput("xBoxes", "X Box")}
        {qtyInput("hubBoxes", "Hub Box")}
        {qtyInput("subBoxes", "Sub Box")}
        {qtyInput("endBoxes", "End Box")}
        {qtyInput("concretePoles", "Poteaux bétons")}
        {qtyInput("metalPoles", "Poteaux métall.")}
        {qtyInput("closures", "Closures")}
        {qtyInput("manholes", "Chambres")}
        {qtyInput("feederLengthM", "Câbles transp.", true)}
        {qtyInput("distLengthM", "Câbles distrib.", true)}
      </div>
    </FormModal>
  );
}
