import { FileAddOutlined } from "@ant-design/icons";
import { message, Tabs, Upload } from "antd";
import { m } from "i18n/messages";
import { useState } from "react";
import { FhpImageType, WorkDocType } from "schema/enums";
import type { FhpPostImagesT } from "schema/fhp";
import type { Maybe } from "schema/utils";
import { twJoin } from "tailwind-merge";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import { useUploader } from "#/hooks/useUploader";
import type { FhpFormProps } from "../fhp-types";
import FhsImageCard from "./FhsImageCard";
import { useFhsImageNames } from "./hooks";
import type { Entry } from "./types";

export const types = Object.values(FhpImageType) as FhpImageType[];

export default function FhpImagesForm({ item, state }: FhpFormProps) {
  const names = useFhsImageNames(item.surveyId);
  const uploader = useUploader();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [tab, setTab] = useState<FhpImageType>(FhpImageType.BOXES);

  const send = useApiPost<FhpPostImagesT>("/fhp/images", ["fhp"]);

  const submit = apiCall(async () => {
    await send.mutateAsync({ id: item.id, images: entries });
    message.success(`Images uploaded`);
    state.close();
  });

  const update = (id: string, up: Partial<Entry>) => {
    setEntries((es) =>
      es.map((e) => (e.uploadId === id ? { ...e, ...up } : e)),
    );
  };

  const remove = ({ uploadId }: Entry) => {
    setEntries((es) => es.filter((e) => e.uploadId !== uploadId));
    uploader.cancel([uploadId]);
  };

  const setName = ({ uploadId }: Entry, name: Maybe<string>) => {
    update(uploadId, { name: name || "" });
  };

  const onUpload = (file: File, type: FhpImageType) => {
    const record = uploader.send(file, { type: WorkDocType.FHP_IMAGE });
    setEntries((es) => [...es, { uploadId: record.id, type, name: "" }]);
    return false;
  };

  return (
    <FormModal
      state={state}
      title={m.fhp_form_images()}
      subtitle={item.work.name}
      width={800}
      onSubmit={submit}
      submitting={send.isPending}
    >
      <Tabs
        size="small"
        centered
        activeKey={tab}
        onChange={(tab) => setTab(tab as FhpImageType)}
        items={types.map((type) => ({
          key: type,
          label: type,
          children: (
            <section className="grid lg:grid-cols-3 gap-2">
              {entries
                .filter((e) => e.type === type)
                .map((e) => (
                  <FhsImageCard
                    key={e.uploadId}
                    entry={e}
                    names={names}
                    uploader={uploader}
                    onRemove={remove}
                    onSetName={setName}
                  />
                ))}
              <Upload
                multiple
                accept="image/*"
                fileList={[]}
                beforeUpload={(file) => onUpload(file, type)}
                classNames={{ trigger: "w-full h-full" }}
              >
                <button
                  type="button"
                  className={twJoin(
                    "min-h-20 w-full h-full flex flex-col items-center justify-center",
                    "border-4 border-dashed text-gray-400 hover:bg-yellow-100/10",
                  )}
                >
                  <FileAddOutlined />
                  Add Image
                </button>
              </Upload>
            </section>
          ),
        }))}
      />
    </FormModal>
  );
}
