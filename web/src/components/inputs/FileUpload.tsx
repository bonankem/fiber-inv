import { PaperClipOutlined } from "@ant-design/icons";
import { Button, Input, Upload, type UploadProps } from "antd";
import { UploadStatus, useUploader } from "#/hooks/useUploader";

type Props = {
  value?: string;
  onChange?: (id: string) => void;
  placeholder?: string;
  accept?: UploadProps["accept"];
  formId?: string;
};

export default function FileUpload(props: Props) {
  const uploader = useUploader();
  const record = uploader.find(props.value || "");
  const showProgress = record.status === UploadStatus.SENDING;

  const onUpload = (file: File) => {
    const u = uploader.send(file, props.formId || "");
    if (props.value) uploader.cancel(props.value);
    props.onChange?.(u.id);
    return false;
  };

  return (
    <Upload
      fileList={[]}
      accept={props.accept}
      beforeUpload={onUpload}
      classNames={{ root: "block", trigger: "w-full" }}
    >
      <div className="flex gap-1 ">
        <div className="grow relative overflow-hidden">
          <Input
            readOnly
            size="small"
            value={record.name}
            className="cursor-pointer w-full"
            placeholder={props.placeholder}
          />

          <div className="absolute min-w-0! h-1 left-1 right-1 bottom-0.5">
            <div
              className="transition-w duration-500 bg-green-600 h-1 rounded-sm"
              style={{
                transition: record.percent < 10 ? "none" : "all 500ms ease",
                opacity: showProgress ? 100 : 0,
                width: `${record.percent}%`,
              }}
            />
          </div>
        </div>
        <Button size="small" className="w-10!" icon={<PaperClipOutlined />} />
      </div>
    </Upload>
  );
}
