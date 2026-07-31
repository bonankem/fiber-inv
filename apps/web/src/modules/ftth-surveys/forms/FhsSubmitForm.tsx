import { Card, Empty, Form, Grid, List, message, Tabs } from "antd";
import { m } from "i18n/messages";
import { useState } from "react";
import { countBy, sumBy } from "remeda";
import { BoxType, WorkDocType } from "schema/enums";
import { type FhsSubmitT, type FtthSurveyT, ftthSurveyFullZ } from "schema/fhs";
import type {
  UpFhsBoxT,
  UpFhsCoordsT,
  UploadT,
  UpOdnKmzT,
} from "schema/uploads";
import { assoc, filterTruthy, type Maybe } from "schema/utils";
import { apiCall, useApiGet, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import FileUpload, { type Parsed } from "#/components/inputs/FileUpload";
import IntInput from "#/components/inputs/IntInput";
import useOnceReady from "#/hooks/useOnceReady";
import { req } from "#/utils/form";
import type { FhsFormProps } from "../fhs-types";

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
  const [kmz, setKmz] = useState<UpOdnKmzT>();

  const full = useApiGet(["fhs", props.item.id], ftthSurveyFullZ);
  const [oldDocs, setOldDocs] = useState<Record<string, UploadT>>();

  useOnceReady(full.data, (full) => {
    const docs = assoc(
      full.work.docs,
      (d) => d.type,
      (d) => d.upload,
    );
    setOldDocs(docs);

    const kmz = docs[WorkDocType.ODN_KMZ];
    const coords = docs[WorkDocType.COORDINATES];
    setKmz(kmz?.parsed as UpOdnKmzT);
    setCoords(coords?.parsed as UpFhsCoordsT);

    const rep = full.report;
    if (rep) {
      form.setFieldsValue({
        hp: rep.hp,
        oltCards: rep.oltCards,
        xBoxes: rep.xBoxes,
        hubBoxes: rep.hubBoxes,
        fats: rep.fats,
        manholes: rep.manholes,
        closures: rep.closures,
        metalPoles: rep.metalPoles,
        concretePoles: rep.concretePoles,
        transportLength: rep.transportLength,
        distLength: rep.distLength,
      });
    }
  });

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
    const fats = up.boxes.filter((b) => b.type === BoxType.FAT);
    const hp = sumBy(fats, (b) => b.hp || 0);
    const oltCards = Math.ceil(hp / 512);
    form.setFieldsValue({ hp, oltCards, ...boxCounts(up.boxes) });
    setCoords(up);
  };

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
        previous={oldDocs?.[type]}
        inputClassName="placeholder:text-gray-400!"
      />
    </Form.Item>
  );

  return (
    <FormModal
      form={form}
      title={m.fhs_form_submit()}
      width={mobile ? 480 : 920}
      state={props.state}
      subtitle={props.item.work.name}
      className="grid gap-4 grid-cols-1 md:grid-cols-3"
      onSubmit={onSubmit}
      preparing={full.isLoading}
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Documents</h2>

        {fileInput("ODN_KMZ", "KMZ", onParseKmz)}
        {fileInput("BOQ", "BOQ")}
        {fileInput("COORDINATES", m.coords(), onParseCoords)}
        {fileInput("PLAN_DIAGRAM", m.plan_diag())}
        {fileInput("SYNOPTIC_DIAGRAM", m.field_synoptic_diag())}
        {fileInput("SYNOPTIC_TABLE", m.field_synoptic_table())}
        {fileInput("CABLE_LENGTHS", m.cable_lengths())}
        {fileInput("HP_SUMMARY", m.hp_summary())}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Nouvelles quantités</h2>

        {qtyInput("hp", m.hp())}
        {qtyInput("oltCards", m.olt_cards())}
        {qtyInput("xBoxes", m.field_x_boxes())}
        {qtyInput("hubBoxes", m.hub_boxes())}
        {qtyInput("fats", m.fat_pbo())}
        {qtyInput("concretePoles", m.concrete_poles())}
        {qtyInput("metalPoles", m.metal_poles())}
        {qtyInput("closures", m.closures())}
        {qtyInput("manholes", m.manholes())}
        {qtyInput("transportLength", m.field_tran_cables(), true)}
        {qtyInput("distLength", m.dist_cables(), true)}
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
          ])}
        />
      </Card>
    </FormModal>
  );
}
