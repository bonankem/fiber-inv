import { Card, Empty, Form, Grid, List, message, Tabs } from "antd";
import { useState } from "react";
import { countBy, sumBy } from "remeda";
import { BoxType, type WorkDocType } from "schema/enums";
import type { FhsSubmitT, FtthSurveyT } from "schema/fhs";
import type { UpFhsBoxT, UpFhsCoordsT, UpPlanKmzT } from "schema/uploads";
import { filterTruthy, type Maybe } from "schema/utils";
import { apiCall, useApiPost } from "#/api/helpers";
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
      className="w-full! text-sm! h-8!"
      addonBefore={<div className="one-line w-28 text-sm!">{label}</div>}
      placeholder={length ? "Longueur" : undefined}
      suffix={length ? "m" : undefined}
      controls={false}
    />
  </Form.Item>
);

function ItemList(props: {
  items: Maybe<{ name: string; oldName?: string }[]>;
  whenNull: string;
  whenEmpty: string;
  showOldNames?: boolean;
}) {
  const shouldHaveData = !!props.items;
  return (
    <List
      size="small"
      locale={{
        emptyText: (
          <Empty
            classNames={{ description: "text-balance" }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={shouldHaveData ? props.whenEmpty : props.whenNull}
          />
        ),
      }}
      className="max-h-118 overflow-y-auto"
      dataSource={props.items ?? undefined}
      renderItem={(item) => {
        const canShowCaption =
          item.oldName && props.showOldNames && item.oldName !== item.name;
        return (
          <List.Item className="text-xs h-fit! min-h-0 py-2! one-line">
            {item.name}
            {canShowCaption && (
              <span className="text-yellow-600 ml-1"> {item.oldName}</span>
            )}
          </List.Item>
        );
      }}
    />
  );
}

export default function FhsSubmitForm(props: FhsFormProps) {
  const [form] = Form.useForm<FhsSubmitT>();
  const mobile = !Grid.useBreakpoint().md;
  const [coords, setCoords] = useState<UpFhsCoordsT>();
  const [kmz, setKmz] = useState<UpPlanKmzT>();

  const submitM = useApiPost<FhsSubmitT, FtthSurveyT>("/fhs/submit", ["fhs"]);

  const onSubmit = apiCall(async (data: FhsSubmitT) => {
    data.id = props.item.id;
    const result = await submitM.mutateAsync(data);
    message.success(`Submitted ${result.work.sid}`);
    props.state.close();
  });

  const boxCounts = (boxes: UpFhsBoxT[]) => {
    const count = countBy(boxes, (b) => b.type ?? "");
    return {
      xBoxes: count.X_BOX ?? 0,
      hubBoxes: count.HUB_BOX,
      subBoxes: count.SUB_BOX,
      endBoxes: count.END_BOX,
    };
  };

  const onParseKmz = (up: UpPlanKmzT) => {
    form.setFieldsValue({
      ...boxCounts(up.boxes),
      metalPoles: up.metalPoles.length,
      concretePoles: up.concretePoles.length,
    });
    setKmz(up);
  };

  const onParseCoords = (up: UpFhsCoordsT) => {
    const fatTypes: Maybe<BoxType>[] = [BoxType.SUB_BOX, BoxType.END_BOX];
    const fats = up.boxes.filter((b) => fatTypes.includes(b.type));
    const hp = sumBy(fats, (b) => b.hp || 0);
    form.setFieldsValue({
      hp,
      oltCards: Math.ceil(hp / 512),
      ...boxCounts(up.boxes),
    });
    setCoords(up);
  };

  return (
    <FormModal
      form={form}
      title="Submit Survey Report"
      width={mobile ? 480 : 880}
      state={props.state}
      subtitle={props.item.work.name}
      className="grid gap-4 grid-cols-1 md:grid-cols-[4fr_3fr_4fr]"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Documents</h2>

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

      <Card classNames={{ body: "p-0!" }}>
        <Tabs
          type="card"
          size="small"
          classNames={{
            header: "mb-0! -mt-[1px]! -ml-[1px]!",
            item: "text-sm!",
          }}
          items={filterTruthy([
            // {
            //   key: "problems",
            //   label: "Problèmes",
            //   children: (
            //     <ItemList
            //       items={kmz || coords ? [] : undefined}
            //       whenEmpty="Aucun problème"
            //       whenNull="Les problèmes dans les documents apparaîtront ici."
            //     />
            //   ),
            // },
            {
              key: "boxes",
              label: "Boitiers",
              children: (
                <ItemList
                  items={coords?.boxes || kmz?.boxes}
                  whenEmpty="Pas de boîtiers"
                  whenNull="Les boitiers sont lues à partir du fichiers KMZ et coordonnées"
                />
              ),
            },
            {
              key: "cables",
              label: "Câbles",
              children: (
                <ItemList
                  items={kmz?.cables}
                  whenEmpty="Pas de câbles"
                  whenNull="Les câbles sont lues à partir des fichiers KMZ et longueurs des câbles"
                  showOldNames
                />
              ),
            },
            {
              key: "poles",
              label: "Poteaux",
              children: (
                <ItemList
                  items={
                    kmz ? [...kmz.metalPoles, ...kmz.concretePoles] : undefined
                  }
                  whenEmpty="Pas de poteaux"
                  whenNull="Les poteaux sont lues à partir du fichier KMZ"
                  showOldNames
                />
              ),
            },
          ])}
        />
      </Card>
    </FormModal>
  );
}
