import { Checkbox, Form, Input, message } from "antd";
import { m } from "i18n/messages";
import { useEffect, useState } from "react";
import { countBy, groupBy } from "remeda";
import { WorkDocType as Type } from "schema/enums";
import type { FhpPostImagesT, FhpPostImageT, FtthProjectT } from "schema/fhp";
import { workDocZ } from "schema/work";
import { apiCall, showAppError, useApiGet, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import GalleryUpload from "#/components/GalleryUpload";
import type { FhpFormProps } from "../fhp-types";

export default function FhpImagesForm(props: FhpFormProps) {
  const send = useApiPost<FhpPostImagesT, FtthProjectT>("/fhp/images");
  const docs = useApiGet(["work", props.item.id, "docs"], workDocZ.array());
  const [confirmed, setConfirmed] = useState(false);

  const state = GalleryUpload.useState([
    { type: Type.FHP_BOX, name: m.boxes() },
    { type: Type.FHP_POLE, name: m.poles() },
  ]);

  useEffect(() => {
    // uncheck when value chaanges
    if (state.value) setConfirmed(false);
  }, [state.value]);

  const checkUniqueLabels = () => {
    const byType = groupBy(state.value, (i) => i.type);
    for (const tab of state.tabs) {
      const list = byType[tab.type];
      if (!list?.length) continue;

      const sep = tab.type === "FHP_BOX" ? "_" : "-";
      const names = list.map((i) => i.name?.trim()?.replace(/[-_ /]/g, sep));
      if (!list.every(Boolean)) {
        showAppError(`All names are required`);
        state.onTab(tab.type);
        return false;
      }

      const counts = Object.entries(countBy(names, (n) => n));
      const dup = counts.find(([k, n]) => k && n > 1)?.[0];
      if (dup) {
        showAppError(`${dup} appears more than once under "${tab.name}"`);
        state.onTab(tab.type);
        return false;
      }
    }
    return true;
  };

  const submit = apiCall(async (d: { comment: string }) => {
    if (!checkUniqueLabels()) {
      setConfirmed(false);
      return;
    }
    const data = {
      id: props.item.id,
      images: [] as FhpPostImageT[],
      remove: [] as string[],
      comment: d.comment,
    };

    for (const i of state.value) {
      const { type, name, newId } = i;
      if (!name) {
        state.onTab(type);
        showAppError("All names are required");
        setConfirmed(false);
        return;
      }
      if (i.old && i.removed) {
        data.remove.push(i.old.id);
      } else if (name && newId) {
        data.images.push({ type, name, uploadId: newId });
      }
    }
    const result = await send.mutateAsync(data);
    message.success(`${result.work.sid} updated`);
    props.state.close();
  });

  return (
    <FormModal
      width="calc(min(1000px,90vw))"
      title={m.fhp_form_images()}
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={submit}
      submitting={send.isPending}
      checkbox={false}
      noDivider
    >
      <GalleryUpload {...state} initial={docs} />

      <section className="flex flex-col gap-2 items-start">
        <Form.Item
          name="comment"
          label={m.comment()}
          required
          className="self-start w-full max-w-lg"
        >
          <Input.TextArea required rows={3} className="resize-none!" />
        </Form.Item>

        <Checkbox
          required
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        >
          {m.check_confirm()}
        </Checkbox>
      </section>
    </FormModal>
  );
}
