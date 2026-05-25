import { LoadingOutlined, PaperClipOutlined } from "@ant-design/icons";
import { Button, Input, Space, Upload, type UploadProps } from "antd";
import { useEffect } from "react";
import type { WorkDocType } from "schema/enums";
import type { UploadParsedT } from "schema/uploads";
import { twJoin } from "tailwind-merge";
import { useUploader } from "#/hooks/useUploader";

export type Parsed<T> = UploadParsedT & { type: T };

type Props<T> = {
  type: T;
  value?: string;
  required?: boolean;
  inputClassName?: string;
  onChange?: (id: string | undefined) => void;
  onParsed?: (p: Parsed<T>) => void;
  accept?: UploadProps["accept"];
  formId?: string;
  placeholder?: string;
};

const defaultAccept: { [key in WorkDocType]?: string } = {
  PLAQUE_KMZ: ".kml,.kmz",
  PLAN_KMZ: ".kml,.kmz",
  PLAN_BOQ: ".xlsx,.xls",
  PLAN_DIAGRAM: ".dwg",
  SYNOPTIC_DIAGRAM: ".dwg",
  SYNOPTIC_TABLE: ".xlsx,.xls",
  COORDINATES: ".xlsx,.xls",
  CABLE_LENGTHS: ".xlsx,.xls",
  HP_SUMMARY: ".xlsx,.xls",
  AS_BUILT_KMZ: ".kml,.kmz",
  AS_BUILT_BOQ: ".xlsx,.xls",
};

export default function FileUpload<T extends WorkDocType>({
  type,
  value,
  required,
  onChange,
  onParsed,
  placeholder,
  inputClassName,
  formId = "",
  accept = defaultAccept[type],
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

  return (
    <Upload
      accept={accept}
      fileList={[]}
      beforeUpload={onUpload}
      classNames={{ root: "block", trigger: "w-full relative" }}
    >
      <Space.Compact className="w-full">
        <Input
          readOnly
          size="small"
          value={record?.name}
          tabIndex={-1} // tab goes straight to the button
          className={twJoin("cursor-pointer w-full text-sm!", inputClassName)}
          onKeyUp={(e) => e.key === " " && (e.target as HTMLElement)?.click?.()}
          placeholder={placeholder}
        />
        {required && !record && (
          <Input
            className="absolute! w-0! h-0! min-w-0! border-0! p-0! opacity-0 bottom-0 left-0"
            tabIndex={-1}
            required
            value=""
            title="Fichier requis"
            onFocus={(e) =>
              (e.target.previousSibling as HTMLElement)?.focus?.()
            }
          />
        )}
        <Button
          size="small"
          className="w-10!"
          type="default"
          icon={sending ? <LoadingOutlined spin /> : <PaperClipOutlined />}
        />
      </Space.Compact>
    </Upload>
  );
}
