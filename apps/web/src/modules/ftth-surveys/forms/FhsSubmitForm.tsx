import { Card, Empty, Form, Grid, List, message, Tabs } from "antd";
import { m } from "i18n/messages";
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
      addonBefore={<div className="one-line w-36 text-sm!">{label}</div>}
      placeholder={length ? m.length() : undefined}
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

  const submitM = useApiPost<FhsSubmitT, FtthSurveyT>("/fhs/submit");

  const onSubmit = apiCall(async (data: FhsSubmitT) => {
    data.id = props.item.id;
    const result = await submitM.mutateAsync(data);
    message.success(`Submitted ${result.work.sid}`);
    props.state.close();
  });

  const boxCounts = (boxes: UpFhsBoxT[]) => {
    const count = countBy(boxes, (b) => b.type ?? "");
    return {
      xBoxes: count.X ?? 0,
      hubBoxes: count.HUB,
      subBoxes: count.SUB,
      endBoxes: count.END,
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
    const fatTypes: Maybe<BoxType>[] = [BoxType.SUB, BoxType.END];
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
      title={m.fhs_form_submit()}
      width={mobile ? 480 : 920}
      state={props.state}
      subtitle={props.item.work.name}
      className="grid gap-4 grid-cols-1 md:grid-cols-3"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Documents</h2>

        {fileInput("PLAN_KMZ", "KMZ", onParseKmz)}
        {fileInput("PLAN_BOQ", "BOQ")}
        {fileInput("COORDINATES", m.field_coords(), onParseCoords)}
        {fileInput("PLAN_DIAGRAM", m.field_plan_diag())}
        {fileInput("SYNOPTIC_DIAGRAM", m.field_synoptic_diag())}
        {fileInput("SYNOPTIC_TABLE", m.field_synoptic_table())}
        {fileInput("CABLE_LENGTHS", m.field_cable_lengths())}
        {fileInput("HP_SUMMARY", m.field_hp_summary())}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Nouvelles quantités</h2>

        {qtyInput("hp", m.field_hp())}
        {qtyInput("olts", m.new_olts())}
        {qtyInput("oltCards", m.field_olt_cards())}
        {qtyInput("xBoxes", m.field_x_boxes())}
        {qtyInput("hubBoxes", m.field_hub_boxes())}
        {qtyInput("subBoxes", m.field_sub_boxes())}
        {qtyInput("endBoxes", m.field_end_boxes())}
        {qtyInput("concretePoles", m.field_concrete_poles())}
        {qtyInput("metalPoles", m.field_metal_poles())}
        {qtyInput("closures", m.field_closures())}
        {qtyInput("manholes", m.field_manholes())}
        {qtyInput("transportLength", m.field_tran_cables(), true)}
        {qtyInput("distLength", m.field_dist_cables(), true)}
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
              label: m.boxes(),
              children: (
                <ItemList
                  items={coords?.boxes || kmz?.boxes}
                  whenEmpty={m.no_boxes()}
                  whenNull={m.report_boxes_hint()}
                />
              ),
            },
            {
              key: "cables",
              label: m.cables(),
              children: (
                <ItemList
                  items={kmz?.cables}
                  whenEmpty={m.no_cables()}
                  whenNull={m.report_cables_hint()}
                  showOldNames
                />
              ),
            },
            {
              key: "poles",
              label: m.poles(),
              children: (
                <ItemList
                  items={
                    kmz ? [...kmz.metalPoles, ...kmz.concretePoles] : undefined
                  }
                  whenEmpty={m.no_poles()}
                  whenNull={m.report_poles_hint()}
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
