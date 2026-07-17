import { CloseOutlined } from "@ant-design/icons";
import { Button, Spin, Upload } from "antd";
import { type MouseEvent, useEffect } from "react";
import type { WorkDocType } from "schema/enums";
import type { UploadParsedT } from "schema/uploads";
import { twJoin } from "tailwind-merge";
import { downloadUrl } from "#/api/helpers";
import { useUploader } from "#/hooks/useUploader";

export type Parsed<T> = UploadParsedT & { type: T };

type Props<T> = {
  type: T;
  value?: string;
  required?: boolean;
  onChange?: (id: string | undefined) => void;
  onParsed?: (p: Parsed<T>) => void;
  formId?: string;
  placeholder?: string;
};

export default function ImageUpload<T extends WorkDocType>({
  type,
  value,
  required,
  onChange,
  onParsed,
  formId = "",
}: Props<T>) {
  const uploader = useUploader();
  const record = uploader.find(value || "");
  const sending = record?.done === false;

  const onUpload = (file: File) => {
    const record = uploader.send(file, {
      type: type,
      formId: formId || "",
      onParse: (p) => p && onParsed?.(p as Parsed<T>),
    });
    if (value) uploader.cancel([value]);
    onChange?.(record.id);
    return false;
  };

  useEffect(() => {
    if (value && !record?.id) onChange?.(undefined);
  }, [onChange, value, record?.id]);

  const url = record?.done ? downloadUrl(record) : null;

  const onRemove = (e: MouseEvent) => {
    e?.preventDefault();
    if (!value) return;
    uploader.cancel([value]);
    onChange?.(undefined);
  };

  return (
    <Spin spinning={sending}>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block"
        >
          <img
            alt=""
            src={url}
            className="w-full h-24! object-cover object-center border rounded-md"
          />
          <Button
            danger
            type="primary"
            size="small"
            className="absolute! top-2 right-2"
            icon={<CloseOutlined />}
            onClick={(e) => onRemove(e)}
          />
        </a>
      ) : (
        <div>
          <Upload
            accept="image/*"
            fileList={[]}
            beforeUpload={onUpload}
            classNames={{ root: "block", trigger: "w-full relative" }}
          >
            <button
              type="button"
              className={twJoin(
                "w-full min-w-48 h-24! rounded-md border",
                "focus:outline-none focus:ring-1 focus:ring-inset focus:ring-brand",
                "bg-gray-100 dark:bg-gray-800",
              )}
            ></button>
          </Upload>
          {required && !record && (
            <input
              className="absolute! w-0! h-0! min-w-0! border-0! p-0! opacity-0 bottom-0 left-0"
              tabIndex={-1}
              required
              value=""
              onChange={() => {}}
              title="Fichier requis"
              onFocus={(e) =>
                (e.target.previousSibling as HTMLElement)?.focus?.()
              }
            />
          )}
        </div>
      )}
    </Spin>
  );
}
