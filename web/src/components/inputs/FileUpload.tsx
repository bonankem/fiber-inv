import { PaperClipOutlined } from "@ant-design/icons";
import { Button, Input, Upload, type UploadProps } from "antd";
import { useEffect } from "react";
import type { WorkDocType } from "schema/enums";
import type { UploadParsedT } from "schema/uploads";
import { useUploader } from "#/hooks/useUploader";

type Parsed<T> = UploadParsedT & { type: T };

type Props<T> = {
  type: T;
  value?: string;
  onChange?: (id: string | undefined) => void;
  onParsed?: (p: Parsed<T>) => void;
  accept?: UploadProps["accept"];
  formId?: string;
  placeholder?: string;
};

const defaultAccept: { [key in WorkDocType]?: string } = {
  PLAQUE_KMZ: ".kml,.kmz",
};

export default function FileUpload<T extends WorkDocType>({
  type,
  value,
  onChange,
  onParsed,
  placeholder,
  formId = "",
  accept = defaultAccept[type],
}: Props<T>) {
  const uploader = useUploader();
  const record = uploader.find(value || "");
  const sending = record?.done === false;
  const percent = record?.percent || 0;

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
      classNames={{ root: "block", trigger: "w-full" }}
    >
      <div className="flex gap-1 ">
        <div className="grow relative overflow-hidden">
          <Input
            readOnly
            size="small"
            value={record?.name}
            className="cursor-pointer w-full"
            placeholder={placeholder}
          />

          <div className="absolute min-w-0! h-1 left-1 right-1 bottom-0.5">
            <div
              className="transition-w duration-500 bg-green-600 h-1 rounded-sm"
              style={{
                transition:
                  percent < 20
                    ? "none"
                    : "width 400ms ease, opacity 200ms ease 200ms",
                opacity: sending ? 100 : 0,
                width: `${percent}%`,
              }}
            />
          </div>
        </div>
        <Button size="small" className="w-10!" icon={<PaperClipOutlined />} />
      </div>
    </Upload>
  );
}
