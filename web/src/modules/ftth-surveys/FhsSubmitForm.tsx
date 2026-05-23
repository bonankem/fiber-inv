import { Form, Grid, Select } from "antd";
import type { WorkDocType } from "schema/enums";
import type { FhsSubmitT } from "schema/fhs";
import { twJoin } from "tailwind-merge";
import FormModal from "#/components/FormModal";
import FileUpload from "#/components/inputs/FileUpload";
import IntInput from "#/components/inputs/IntInput";
import { req } from "#/utils/form";
import type { FhsFormProps } from "./fhs-types";

export default function FhsSubmitForm(props: FhsFormProps) {
  const mobile = !Grid.useBreakpoint().md;

  const fileInput = (type: WorkDocType, label: string, accept?: string) => (
    <Form.Item name={type} {...req}>
      <FileUpload
        required
        {...{ type, accept, placeholder: label }}
        inputClassName="placeholder:text-gray-400!"
      />
    </Form.Item>
  );

  const qtyInput = (name: keyof FhsSubmitT, label: string) => (
    <Form.Item name={name} rules={req.rules}>
      <IntInput
        required
        className="w-full!"
        addonBefore={<div className="one-line w-40">{label}</div>}
        controls={false}
      />
    </Form.Item>
  );

  const lenInput = (name: keyof FhsSubmitT, label: string) => (
    <Form.Item name={name} rules={req.rules}>
      <IntInput
        required
        className="w-full! text-sm!"
        addonBefore={<div className="one-line w-40">{label}</div>}
        suffix={"m"}
        placeholder="Longueur"
        controls={false}
      />
    </Form.Item>
  );

  return (
    <FormModal
      title="Submit Survey Report"
      width={mobile ? 480 : 880}
      state={props.state}
      subtitle={props.item.work.name}
      className={twJoin(
        "grid gap-4",
        mobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3",
      )}
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Fichiers</h2>

        {fileInput("PLAN_KMZ", "KMZ", ".kml,.kmz")}
        {fileInput("PLAN_BOQ", "BOQ", ".xlsx,.xls")}
        {fileInput("PLAN_DIAGRAM", "Plan (DWG)", ".dwg,.pdf")}
        {fileInput("SYNOPTIC_DIAGRAM", "Synoptique (DWG)", ".dwg,.pdf")}
        {fileInput("SYNOPTIC_TABLE", "Tableau Synoptique", ".xlsx,.xls")}
        {fileInput("COORDINATES", "Coordonnées", ".xlsx,.xls")}
        {fileInput("CABLE_LENGTHS", "Longueurs des câbles", ".xlsx,.xls")}
        {fileInput("HP_SUMMARY", "Récapitulatif des ELs", ".xlsx,.xls")}

        <Form.Item name="existingOltId">
          <Select
            placeholder="OLT Existante (facultatif)"
            classNames={{ placeholder: "text-gray-400!" }}
          />
        </Form.Item>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Quantités</h2>

        {qtyInput("hp", "EL")}
        {qtyInput("newOlts", "OLTs Nouveau")}
        {qtyInput("oltCards", "Cartes OLT")}
        {qtyInput("xBoxes", "X Box")}
        {qtyInput("hubBoxes", "Hub Box")}
        {qtyInput("subBoxes", "Sub Box")}
        {qtyInput("endBoxes", "End Box")}
        {qtyInput("closures", "Closures")}
        {qtyInput("manholes", "Manholes")}
        {qtyInput("concretePoles", "Poteaux bétons")}
        {qtyInput("metalPoles", "Poteaux métalliques")}
        {lenInput("feederLengthM", "Câbles transport")}
        {lenInput("distLengthM", "Câbles boitiers")}
      </div>
    </FormModal>
  );
}
