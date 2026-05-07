import { PaperClipOutlined } from "@ant-design/icons";
import { Button, Input, Upload } from "antd";
import { useState } from "react";
import { uuidv7 } from "uuidv7";
import { UploadStatus, useUploader } from "#/hooks/useUploader";

type Props = {
  value?: string;
  onChange?: (id: string) => void;
  placeholder?: string;
};

const formId = uuidv7();

export default function FileUpload(props: Props) {
  const uploader = useUploader();
  const [id, setId] = useState<string>();
  const up = uploader.find(id || "");
  const showProgress = up.status === UploadStatus.SENDING;

  const onUpload = (file: File) => {
    const u = uploader.send(file, formId);
    if (id) uploader.cancel(id);
    setId(u.id);
    return false;
  };

  return (
    <Upload
      fileList={[]}
      beforeUpload={onUpload}
      classNames={{ root: "block", trigger: "w-full" }}
    >
      <div className="flex gap-1 ">
        <div className="grow relative overflow-hidden">
          <Input
            readOnly
            size="small"
            value={up.name}
            className="cursor-pointer w-full"
            placeholder={props.placeholder}
          />

          <div className="absolute min-w-0! h-1 left-1 right-1 bottom-0.5">
            <div
              className="transition-w duration-500 bg-green-600 h-1 rounded-sm"
              style={{
                transition: up.percent < 10 ? "none" : "all 500ms ease",
                opacity: showProgress ? 100 : 0,
                width: `${up.percent}%`,
              }}
            />
          </div>
        </div>
        <Button size="small" className="w-10!" icon={<PaperClipOutlined />} />
      </div>
    </Upload>
  );
}
