import { LoadingOutlined, PaperClipOutlined } from "@ant-design/icons";
import { Button, Input, Space, Upload, type UploadProps } from "antd";
import { useEffect } from "react";
import type { WorkDocType } from "schema/enums";
import type { UploadParsedT, UploadT } from "schema/uploads";
import { twJoin } from "tailwind-merge";
import { useUploader } from "#/hooks/useUploader";

export type Parsed<T> = UploadParsedT & { type: T };

type Props<T> = {
  type: T;
  value?: string;
  required?: boolean;
  previous?: UploadT;
  inputClassName?: string;
  onChange?: (id: string | undefined) => void;
  onParsed?: (p: Parsed<T>) => void;
  accept?: UploadProps["accept"];
  formId?: string;
  placeholder?: string;
};

const defaultAccept: { [key in WorkDocType]?: string } = {
  AREA_KMZ: ".kml,.kmz",
  ODN_KMZ: ".kml,.kmz",
  BOQ: ".xlsx,.xls",
  PLAN_DIAGRAM: ".dwg",
  SYNOPTIC_DIAGRAM: ".dwg",
  SYNOPTIC_TABLE: ".xlsx,.xls",
  COORDINATES: ".xlsx,.xls",
  CABLE_LENGTHS: ".xlsx,.xls",
  HP_SUMMARY: ".xlsx,.xls",
};

export default function FileUpload<T extends WorkDocType>({
  type,
  value,
  required,
  previous,
  onChange,
  onParsed,
  placeholder,
  inputClassName,
  formId = "",
  accept = defaultAccept[type],
}: Props<T>) {
  const uploader = useUploader();

  const usingOld = !!value && value === previous?.id;
  const record = value && !usingOld ? uploader.find(value) : undefined;
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
    const oldId = previous?.id;
    const newId = record?.id;
    if (value === oldId) return;
    // use the previous ID as the initial value
    else if (oldId && !value) onChange?.(oldId);
    // if record is undefined, then the upload failed, so clear the value
    else if (value && !newId) onChange?.(oldId);
  }, [onChange, value, record?.id, previous?.id]);

  const needsValue = required && !record && !previous;
  const textColor = !previous
    ? undefined
    : usingOld
      ? "text-purple-800!"
      : "text-green-600!";

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
          value={record?.name || previous?.name}
          tabIndex={-1} // tab goes straight to the button
          className={twJoin(
            "cursor-pointer w-full text-sm!",
            inputClassName,
            textColor,
          )}
          onKeyUp={(e) => e.key === " " && (e.target as HTMLElement)?.click?.()}
          placeholder={placeholder}
        />
        {needsValue && (
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
          type="default"
          className={twJoin("w-10! text-sm!")}
          icon={sending ? <LoadingOutlined spin /> : <PaperClipOutlined />}
        />
      </Space.Compact>
    </Upload>
  );
}
