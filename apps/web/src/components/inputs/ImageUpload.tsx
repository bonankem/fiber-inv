import {
  CloseOutlined,
  HistoryOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { Button, Spin, Tooltip, Upload } from "antd";
import { Image } from "lucide-react";
import { useEffect } from "react";
import type { IdNameT } from "schema/common";
import type { WorkDocType } from "schema/enums";
import type { UploadParsedT } from "schema/uploads";
import { downloadUrl } from "#/api/helpers";
import { useUploader } from "#/hooks/useUploader";

export type Parsed<T> = UploadParsedT & { type: T };

type Props<T> = {
  type: T;
  formId?: string;
  value?: string;
  required?: boolean;
  onChange?: (id: string | undefined) => void;
  placeholder?: string;
  previous?: IdNameT;
};

export default function ImageUpload<T extends WorkDocType>({
  type,
  value,
  previous,
  required,
  onChange,
  formId = "",
}: Props<T>) {
  const uploader = useUploader();

  const hasNew = !!value && value !== "remove" && value !== previous?.id;
  const hasOld = !!previous && value !== "remove";
  const hasAny = hasOld || hasNew;
  const needsValue = required && !hasAny;

  const record = hasNew ? uploader.find(value || "") : undefined;
  const sending = record?.done === false;

  const upload = (file: File) => {
    const record = uploader.send(file, { type, formId });
    if (hasNew) uploader.cancel([value]);
    onChange?.(record.id);
    return false;
  };

  const remove = () => {
    if (hasOld) {
      onChange?.("remove");
    } else if (hasNew) {
      uploader.cancel([value]);
      onChange?.(undefined);
    }
  };

  const revert = () => {
    onChange?.(previous?.id);
  };

  useEffect(() => {
    if (previous?.id && !value) onChange?.(previous.id);
    else if (hasNew && !record?.id) onChange?.(previous?.id);
  }, [onChange, hasNew, record?.id, previous?.id, value]);

  const toShow = record?.done ? record : hasOld ? previous : null;
  const url = toShow ? downloadUrl(toShow) : null;

  return (
    <Spin spinning={sending}>
      <div className="group relative block w-full min-w-30 h-24!">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full"
            title="Click to preview"
          >
            <img
              alt=""
              src={url}
              className="w-full h-full object-cover object-center border rounded-md"
            />
          </a>
        ) : (
          <Upload
            accept="image/*"
            beforeUpload={upload}
            classNames={{ trigger: "size-full" }}
            fileList={[]}
          >
            <button
              type="button"
              className="centered big-gray-button size-full"
            >
              <Image size={24} />
            </button>
          </Upload>
        )}

        <div className="absolute top-2 right-2 flex gap-2 opacity-85 hover:opacity-100">
          {value === "remove" && (
            <Tooltip title="Restore old image" placement="top">
              <Button icon={<HistoryOutlined />} onClick={revert} />
            </Tooltip>
          )}

          {hasAny && (
            <Tooltip title="Change" placement="top">
              <Upload accept="image/*" beforeUpload={upload} fileList={[]}>
                <Button icon={<SwapOutlined />} />
              </Upload>
            </Tooltip>
          )}

          {hasAny && (
            <Tooltip title="Remove" placement="top">
              <Button
                danger
                type="primary"
                icon={<CloseOutlined />}
                onClick={remove}
              />
            </Tooltip>
          )}
        </div>

        {needsValue && (
          <input
            className="absolute! w-0! h-0! min-w-0! border-0! p-0! opacity-0 bottom-0 left-0"
            tabIndex={-1}
            required
            value=""
            onChange={() => {}}
            title="Fichier requis"
          />
        )}
      </div>
    </Spin>
  );
}
