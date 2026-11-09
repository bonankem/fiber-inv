import { Form, message } from "antd";
import { m } from "i18n/messages";
import { useState } from "react";
import { WorkDocType } from "schema/enums";
import { type FhsSubmitBomT, ftthSurveyFullZ } from "schema/fhs";
import type { UpFhsBomT } from "schema/uploads";
import { useApiGet } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import EquipmentLinesEditor, {
  checkLines,
  filledLines,
  type LineRowT,
  newLineRow,
} from "#/components/inputs/EquipmentLinesEditor";
import FormFooter from "#/components/inputs/FormFooter";
import WorkDocInput from "#/components/inputs/WorkDocInput";
import useOnceReady from "#/hooks/useOnceReady";
import { type FhsFormProps, useFhsUpdate } from "../fhs-types";

export default function FhsSubmitBomForm(props: FhsFormProps) {
  const [form] = Form.useForm<FhsSubmitBomT>();
  const full = useApiGet(["fhs", props.item.id], ftthSurveyFullZ);
  const [rows, setRows] = useState<LineRowT[]>([newLineRow()]);
  const [showErrors, setShowErrors] = useState(false);

  // after a rejection, start from the BOM that was sent before
  useOnceReady(full.data, (full) => {
    if (full.bom.length) {
      setRows(full.bom.map((b) => newLineRow(b.equipment, b.quantity)));
    }
  });

  // fill the lines from the uploaded BOQ, matched to inventory by MTN code
  const onBoqParsed = ({ lines }: UpFhsBomT) => {
    const matched = lines.flatMap((l) =>
      l.equipment ? [newLineRow(l.equipment, l.quantity)] : [],
    );
    const missing = lines.filter((l) => !l.equipment).map((l) => l.code);
    if (matched.length) setRows(matched);
    if (missing.length) {
      message.warning(
        `Not in inventory, add these lines manually: ${missing.join(", ")}`,
        8,
      );
    } else if (!matched.length) {
      message.info("No BOQ lines found in this file");
    }
  };

  const up = useFhsUpdate<FhsSubmitBomT>(
    "fhs/bom",
    props,
    m.toast_submitted,
    () => {
      setShowErrors(true);
      return checkLines(rows);
    },
  );

  return (
    <FormModal
      {...up}
      form={form}
      width={960}
      title={m.fhs_submit_bom()}
      state={props.state}
      subtitle={props.item.work.name}
      preparing={full.isLoading}
      onSubmit={(data) =>
        up.onSubmit({
          ...data,
          items: filledLines(rows).map((l) => ({
            equipmentId: l.item.id,
            quantity: l.quantity,
          })),
        })
      }
    >
      <WorkDocInput
        type={WorkDocType.FHS_BOM}
        label={m.bom()}
        old={full}
        onParsed={onBoqParsed}
      />
      <EquipmentLinesEditor
        rows={rows}
        onChange={setRows}
        showErrors={showErrors}
      />

      <FormFooter />
    </FormModal>
  );
}
